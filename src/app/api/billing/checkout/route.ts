import { NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertBillingRecord } from "@/lib/billing-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutPlan = "pilot" | "platform";

type CheckoutBody = {
  plan?: unknown;
  tier?: unknown;
  priceKey?: unknown;
  lookupKey?: unknown;
  lang?: string;
  email?: string;
};

const PRICE_ENV_BY_PLAN: Record<CheckoutPlan, "STRIPE_PILOT_PRICE_ID" | "STRIPE_PLATFORM_PRICE_ID"> = {
  pilot: "STRIPE_PILOT_PRICE_ID",
  platform: "STRIPE_PLATFORM_PRICE_ID",
};

/**
 * Returns JSON with browser and edge cache bypass headers.
 */
function noStoreJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/**
 * Reads a trimmed environment value.
 */
function readEnv(name: string): string | null {
  return process.env[name]?.trim() || null;
}

/**
 * Maps accepted client plan keys to server-owned price ids.
 */
function resolveCheckoutPlan(body: CheckoutBody): CheckoutPlan | null {
  const raw = body.plan ?? body.tier ?? body.priceKey ?? body.lookupKey;
  return raw === "pilot" || raw === "platform" ? raw : null;
}

/**
 * Creates a Stripe client from the server secret.
 */
function getRouteStripeClient() {
  const key = readEnv("STRIPE_SECRET_KEY");
  return key ? new Stripe(key, { apiVersion: "2025-08-27.basil" }) : null;
}

/**
 * Builds absolute redirect origins for Checkout.
 */
function siteOrigin(request: Request): string {
  const configured = readEnv("NEXT_PUBLIC_SITE_URL");
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : "https://metis.gold";
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }

  const plan = resolveCheckoutPlan(body);
  if (!plan) {
    return noStoreJson({ error: "Invalid plan." }, 400);
  }

  const stripe = getRouteStripeClient();
  if (!stripe) {
    return noStoreJson({ error: "Billing checkout is not configured. Contact billing." }, 503);
  }

  const priceEnvName = PRICE_ENV_BY_PLAN[plan];
  const priceId = readEnv(priceEnvName);
  if (!priceId) {
    return noStoreJson(
      {
        error: "Billing checkout price is not configured. Contact billing.",
        plan,
        missing: priceEnvName,
      },
      503,
    );
  }

  const lang = typeof body.lang === "string" && body.lang.trim() ? body.lang.trim() : "en";
  const origin = siteOrigin(request);
  const successUrl = `${origin}/${lang}/portal/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/${lang}/portal/dashboard/billing/cancel`;

  const customerEmail =
    typeof body.email === "string" && body.email.trim() ? body.email.trim() : undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: plan === "pilot" ? "payment" : "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: { plan, lang },
    });

    if (customerEmail) {
      upsertBillingRecord(customerEmail, {
        paymentState: "payment_pending",
        billingStatus: "checkout_started",
        invoiceStatus: "pending",
        paymentStatus: "pending",
        lastCheckoutSessionId: session.id,
      });
    }

    if (!session.url) {
      return noStoreJson({ error: "Checkout session missing URL." }, 502);
    }

    return noStoreJson({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[billing/checkout]", error);
    return noStoreJson({ error: "Unable to start checkout." }, 502);
  }
}
