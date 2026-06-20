import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE } from "@/lib/portal-session";

export const dynamic = "force-dynamic";

const API_TARGET =
  process.env.INTERNAL_API_URL ??
  process.env.FASTAPI_PROXY_TARGET ??
  "http://127.0.0.1:8000";

type CustomerIdentity = {
  id?: string;
  email: string;
  name?: string;
};

function normalizeIdentity(data: unknown): CustomerIdentity | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;
  const email = record.email;

  if (typeof email !== "string" || !email.trim()) {
    return null;
  }

  return {
    id: typeof record.id === "string" ? record.id : undefined,
    email: email.trim(),
    name: typeof record.name === "string" ? record.name.trim() : undefined,
  };
}

function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);

  if (!session?.value) {
    return noStoreJson({ error: "SESSION_REQUIRED" }, 401);
  }

  try {
    const response = await fetch(`${API_TARGET}/auth/user/me`, {
      headers: {
        Cookie: `${USER_SESSION_COOKIE}=${session.value}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return noStoreJson({ error: "SESSION_INVALID" }, response.status === 401 ? 401 : 503);
    }

    const identity = normalizeIdentity(await response.json());

    if (!identity) {
      return noStoreJson({ error: "SESSION_INVALID" }, 503);
    }

    return noStoreJson(identity);
  } catch {
    return noStoreJson({ error: "NETWORK" }, 502);
  }
}
