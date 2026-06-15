import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getPortalSessionCookie,
  portalSessionCookieHeader,
} from "@/lib/portal-session";

export const dynamic = "force-dynamic";

const API_TARGET =
  process.env.INTERNAL_API_URL ??
  process.env.FASTAPI_PROXY_TARGET ??
  "http://127.0.0.1:8000";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionHeader = portalSessionCookieHeader(cookieStore);
    const sessionCookie = getPortalSessionCookie(cookieStore);

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (sessionHeader) {
      headers.Cookie = sessionHeader;
    }
    if (sessionCookie?.value) {
      headers.Authorization = `Bearer ${sessionCookie.value}`;
    }

    const response = await fetch(`${API_TARGET}/tenants`, {
      headers,
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: "CARRIER_LINK_PENDING" },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        },
      );
    }

    if (!response.ok) {
      let body: unknown = { error: `HTTP_${response.status}` };
      try {
        body = await response.json();
      } catch {
        // keep default error body
      }
      return NextResponse.json(body, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const data: unknown = await response.json();
    return NextResponse.json(data, {
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
