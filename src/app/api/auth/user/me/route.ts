import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { USER_SESSION_COOKIE } from "@/lib/portal-session";

export const dynamic = "force-dynamic";

const API_TARGET =
  process.env.INTERNAL_API_URL ??
  process.env.FASTAPI_PROXY_TARGET ??
  "http://127.0.0.1:8000";

type OperatorRecord = {
  id?: string;
  email?: string;
  name?: string;
};

function normalizeOperator(data: unknown): OperatorRecord | null {
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

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);

  if (!session?.value) {
    return NextResponse.json(
      { error: "SESSION_REQUIRED" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
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
      return NextResponse.json(
        { error: "SESSION_INVALID" },
        {
          status: response.status === 401 ? 401 : 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    const data: unknown = await response.json();
    const operator = normalizeOperator(data);
    if (!operator) {
      return NextResponse.json(
        { error: "SESSION_INVALID" },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    return NextResponse.json(operator, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "NETWORK" },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
