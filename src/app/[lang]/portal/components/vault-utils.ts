export const PLAINTEXT_TTL_MS = 90_000;
export const KEY_VAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type KeyRecord = {
  id: string;
  masked: string;
  plaintext: string | null;
  issuedAt: number | null;
  createdAt: number;
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
  return `metis_••••••••${suffix}`;
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

export function extractKeys(data: unknown): Array<{ id: string; token: string }> {
  try {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data.flatMap((row) => {
        if (!row || typeof row !== "object") {
          return [];
        }
        const record = row as Record<string, unknown>;
        const id = record.id ?? record.key_id;
        const token = record.token ?? record.key ?? record.secret;
        if (typeof id === "string" && typeof token === "string") {
          return [{ id, token }];
        }
        if (typeof token === "string") {
          return [{ id: token.slice(-8), token }];
        }
        return [];
      });
    }

    if (typeof data === "object") {
      const record = data as Record<string, unknown>;
      const nested = record.keys ?? record.items ?? record.credentials;
      if (Array.isArray(nested)) {
        return extractKeys(nested);
      }
      const id = record.id ?? record.key_id;
      const token = record.token ?? record.key ?? record.secret;
      if (typeof token === "string") {
        return [{ id: typeof id === "string" ? id : token.slice(-8), token }];
      }
    }

    return [];
  } catch {
    return [];
  }
}

export function mapLoadedKey(entry: { id: string; token: string }): KeyRecord {
  return {
    id: entry.id,
    masked: normalizeMaskedToken(entry.token),
    plaintext: null,
    issuedAt: null,
    createdAt: deriveIssuedAt(entry.id),
  };
}

export function mapIssuedKey(entry: { id: string; token: string }): KeyRecord {
  const now = Date.now();
  return {
    id: entry.id,
    masked: maskToken(entry.token),
    plaintext: entry.token,
    issuedAt: now,
    createdAt: now,
  };
}
