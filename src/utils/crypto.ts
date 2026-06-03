import { createHash } from "node:crypto";

export function getCommitToken(): string | null {
  return (
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    null
  );
}

export function getSystemBootSignature(): string {
  const token = getCommitToken();
  if (token) {
    return createHash("sha256").update(token).digest("hex");
  }
  const seed = "METIS_LOCAL_GENESIS_NODE";
  let h = 0;
  for (const c of seed) {
    h = (h * 31 + c.charCodeAt(0)) >>> 0;
  }
  return createHash("sha256").update(`local-${h}`).digest("hex");
}
