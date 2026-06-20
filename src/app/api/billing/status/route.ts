import { NextResponse } from "next/server";
import { getBillingRecord } from "@/lib/billing-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  let email: string | null = null;

  try {
    const meRes = await fetch(new URL("/api/session/identity", request.url), {
      headers: { cookie },
      cache: "no-store",
    });
    if (meRes.ok) {
      const me = (await meRes.json()) as { email?: string };
      if (typeof me.email === "string" && me.email.trim()) {
        email = me.email.trim();
      }
    }
  } catch {
    email = null;
  }

  const record = email ? getBillingRecord(email) : null;

  return NextResponse.json({
    authenticated: Boolean(email),
    email,
    billing: record,
    achWireInstructions: "ACH/wire details supplied on invoice for qualified accounts.",
    receiptsAvailable:
      record?.paymentState === "payment_received" || record?.paymentState === "active",
  });
}
