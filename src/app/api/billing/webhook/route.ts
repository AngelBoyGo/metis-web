import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  applyPastDue,
  applyPilotCheckout,
  applyPlatformCheckout,
} from "@/lib/billing-store";
import { getStripeClient } from "@/lib/stripe-config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const stripe = getStripeClient();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[billing/webhook] signature", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.customer_details?.email ??
        session.customer_email ??
        session.metadata?.email ??
        null;
      const plan = session.metadata?.plan;
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      if (email && plan === "pilot") {
        applyPilotCheckout(email, session.id, customerId);
      } else if (email && plan === "platform") {
        let nextBillingDate: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          const periodEnd = (sub as Stripe.Subscription & { current_period_end?: number })
            .current_period_end;
          if (periodEnd) {
            nextBillingDate = new Date(periodEnd * 1000).toISOString();
          }
        }
        applyPlatformCheckout(email, session.id, customerId, subscriptionId, nextBillingDate);
      }

      console.info("[billing/webhook] checkout.session.completed", {
        sessionId: session.id,
        plan,
        email,
      });
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const email = invoice.customer_email;
      if (email) {
        applyPastDue(email);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id;
      console.info("[billing/webhook] subscription.deleted", { customerId });
    }
  } catch (error) {
    console.error("[billing/webhook] handler", error);
    return NextResponse.json({ error: "Webhook handler error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
