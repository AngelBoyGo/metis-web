export const DEFAULT_KEY_PREFIX = "mgk_live_au_";
export const PLAINTEXT_TTL_MS = 60_000;
export const KEY_VAULT_TTL_SECONDS = 3600;
export const KEY_VAULT_TTL_MS = KEY_VAULT_TTL_SECONDS * 1000;

export type KeyRecord = {
  id: string;
  prefix: string;
  displayHash: string;
  masked: string;
  plaintext: string | null;
  issuedAt: number | null;
  createdAt: number;
};

export type ExtractedKey = {
  id: string;
  token?: string;
  masked?: string;
  prefix?: string;
  hash?: string;
  createdAt?: number;
};

function stableHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Maps a key id to a deterministic issued-at timestamp inside a rolling 30-day window.
 */
export function deriveIssuedAt(id: string): number {
  const offset = stableHash(id) % KEY_VAULT_TTL_MS;
  return Date.now() - offset;
}

/**
 * Formats remaining vault TTL as descending Dd HH:MM:SS against a 30-day baseline.
 */
export function ttlCountdown(createdAt: number, now = Date.now()): string {
  const expiresAt = createdAt + KEY_VAULT_TTL_MS;
  const remaining = Math.max(0, expiresAt - now);
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  return `${days}d ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatIssuedTimestamp(createdAt: number): string {
  return new Date(createdAt).toISOString().replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

export function maskToken(raw: string): string {
  const suffix = raw.length >= 4 ? raw.slice(-4) : raw;
  return `${derivePrefix(raw)}••••••••${suffix}`;
}

export function normalizeMaskedToken(token: string): string {
  if (token.includes("••••") || token.includes("****")) {
    return token;
  }
  return maskToken(token);
}

export function activePlaintext(entry: KeyRecord): string | null {
  if (!entry.plaintext || entry.issuedAt === null) {
    return null;
  }
  if (Date.now() - entry.issuedAt > PLAINTEXT_TTL_MS) {
    return null;
  }
  return entry.plaintext;
}

export function secondsRemaining(entry: KeyRecord): number {
  if (!entry.plaintext || entry.issuedAt === null) {
    return 0;
  }
  return Math.max(0, Math.ceil((PLAINTEXT_TTL_MS - (Date.now() - entry.issuedAt)) / 1000));
}

export function derivePrefix(value: string | undefined): string {
  if (!value) {
    return DEFAULT_KEY_PREFIX;
  }
  if (value.startsWith(DEFAULT_KEY_PREFIX)) {
    return DEFAULT_KEY_PREFIX;
  }
  const prefixMatch = value.match(/^([a-z0-9]+_[a-z0-9]+_[a-z0-9]+_)/i);
  return prefixMatch?.[1] ?? DEFAULT_KEY_PREFIX;
}

export function normalizeDisplayHash(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  return value.startsWith("sha256:") ? value : `sha256:${value}`;
}

export function deriveSealedDisplayHash(id: string, prefix: string): string {
  const seed = `${prefix}:${id}`;
  const first = stableHash(seed).toString(16).padStart(8, "0");
  const second = stableHash(`${seed}:sealed`).toString(16).padStart(8, "0");
  return `sha256:${first}${second} · sealed display`;
}

export async function deriveTokenHash(token: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    return `sha256:pending · local display`;
  }
  const encoded = new TextEncoder().encode(token);
  const digest = await subtle.digest("SHA-256", encoded);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `sha256:${hash}`;
}

function toStringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function parseCreatedAt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function extractKeyObject(record: Record<string, unknown>): ExtractedKey[] {
  const id = toStringValue(record.id ?? record.key_id ?? record.keyId);
  const token = toStringValue(record.token ?? record.key ?? record.secret ?? record.plaintext);
  const masked = toStringValue(record.masked ?? record.masked_key ?? record.maskedKey);
  const prefix = toStringValue(record.prefix ?? record.key_prefix ?? record.keyPrefix);
  const hash = toStringValue(
    record.hash ?? record.hash_prefix ?? record.hashPrefix ?? record.sha256 ?? record.digest,
  );
  const recordId = id ?? token?.slice(-8) ?? masked ?? prefix ?? hash;
  if (!recordId) {
    return [];
  }
  return [
    {
      id: recordId,
      token,
      masked,
      prefix,
      hash,
      createdAt: parseCreatedAt(record.createdAt ?? record.created_at ?? record.issuedAt ?? record.issued_at),
    },
  ];
}

export function extractKeys(data: unknown): ExtractedKey[] {
  try {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data.flatMap((row) => {
        if (!row || typeof row !== "object") {
          return [];
        }
        return extractKeyObject(row as Record<string, unknown>);
      });
    }

    if (typeof data === "object") {
      const record = data as Record<string, unknown>;
      const nested = record.keys ?? record.items ?? record.credentials;
      if (Array.isArray(nested)) {
        return extractKeys(nested);
      }
      return extractKeyObject(record);
    }

    return [];
  } catch {
    return [];
  }
}

export function mapLoadedKey(entry: ExtractedKey): KeyRecord {
  const prefix = entry.prefix ?? derivePrefix(entry.token ?? entry.masked);
  const displayHash = normalizeDisplayHash(entry.hash) ?? deriveSealedDisplayHash(entry.id, prefix);
  return {
    id: entry.id,
    prefix,
    displayHash,
    masked: entry.masked ?? normalizeMaskedToken(entry.token ?? prefix),
    plaintext: null,
    issuedAt: null,
    createdAt: entry.createdAt ?? deriveIssuedAt(entry.id),
  };
}

export async function mapIssuedKey(entry: ExtractedKey & { token: string }): Promise<KeyRecord> {
  const now = Date.now();
  const prefix = entry.prefix ?? derivePrefix(entry.token);
  const displayHash = normalizeDisplayHash(entry.hash) ?? (await deriveTokenHash(entry.token));
  return {
    id: entry.id,
    prefix,
    displayHash,
    masked: maskToken(entry.token),
    plaintext: entry.token,
    issuedAt: now,
    createdAt: now,
  };
}
