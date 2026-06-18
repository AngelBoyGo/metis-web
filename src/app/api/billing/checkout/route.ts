import { NextResponse } from "next/server";
import { upsertBillingRecord } from "@/lib/billing-store";
import {
  getPriceId,
  getStripeClient,
  siteOrigin,
  type CheckoutPlan,
} from "@/lib/stripe-config";

export const runtime = "nodejs";

type CheckoutBody = {
  plan?: CheckoutPlan;
  lang?: string;
  email?: string;
};

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const plan = body.plan;
  if (plan !== "pilot" && plan !== "platform") {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const priceId = getPriceId(plan);
  if (!stripe || !priceId) {
    return NextResponse.json(
      { error: "Billing checkout is not configured. Contact billing." },
      { status: 503 },
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
      return NextResponse.json({ error: "Checkout session missing URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("[billing/checkout]", error);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 502 });
  }
}
