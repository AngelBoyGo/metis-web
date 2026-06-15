export const PLAINTEXT_TTL_MS = 90_000;

export type KeyRecord = {
  id: string;
  masked: string;
  plaintext: string | null;
  issuedAt: number | null;
};

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
  };
}

export function mapIssuedKey(entry: { id: string; token: string }): KeyRecord {
  return {
    id: entry.id,
    masked: maskToken(entry.token),
    plaintext: entry.token,
    issuedAt: Date.now(),
  };
}
