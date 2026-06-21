import { NextResponse } from "next/server";
import { getBillingRecord } from "@/lib/billing-store";
import { getBillingInvoices } from "../reconciliation-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns JSON with browser and edge cache bypass headers.
 */
function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

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
  const invoices = email ? getBillingInvoices(email) : [];

  return noStoreJson({
    authenticated: Boolean(email),
    email,
    billing: record,
    billingIntegrationStatus: invoices.length > 0 ? "linked" : "unconfigured",
    verifiedInvoices: invoices,
    achWireInstructions: "ACH/wire details supplied on invoice for qualified accounts.",
    receiptsAvailable:
      invoices.length > 0 &&
      (record?.paymentState === "payment_received" || record?.paymentState === "active"),
  });
}
