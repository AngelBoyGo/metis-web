import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  applyPastDue,
  applyPilotCheckout,
  applyPlatformCheckout,
} from "@/lib/billing-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookReceipt = {
  eventId: string;
  eventType: string;
  sessionId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  email: string | null;
  plan: string | null;
  paymentStatus: string | null;
  billingStoreUpdated: boolean;
  backendHandoffRequired: boolean;
  backendHandoffReason: string;
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
 * Creates a Stripe client from the server secret.
 */
function getRouteStripeClient() {
  const key = readEnv("STRIPE_SECRET_KEY");
  return key ? new Stripe(key, { apiVersion: "2025-08-27.basil" }) : null;
}

/**
 * Extracts a Stripe id from string or expanded object values.
 */
function stripeId(value: string | { id?: string } | null | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  return typeof value?.id === "string" ? value.id : null;
}

/**
 * Creates the common backend handoff receipt fields.
 */
function backendHandoff() {
  return {
    backendHandoffRequired: true,
    backendHandoffReason:
      "No frontend route for metis.db invoice persistence or internal billing update endpoint was found under src/app.",
  };
}

export async function POST(request: Request) {
  const webhookSecret = readEnv("STRIPE_WEBHOOK_SECRET");
  const stripe = getRouteStripeClient();

  if (!stripe || !webhookSecret) {
    return noStoreJson(
      {
        error: "Webhook not configured.",
        missing: !stripe ? "STRIPE_SECRET_KEY" : "STRIPE_WEBHOOK_SECRET",
      },
      503,
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return noStoreJson({ error: "Missing signature." }, 400);
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[billing/webhook] signature", error);
    return noStoreJson({ error: "Invalid signature." }, 400);
  }

  let receipt: WebhookReceipt | null = null;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.customer_details?.email ??
        session.customer_email ??
        session.metadata?.email ??
        null;
      const plan = session.metadata?.plan;
      const customerId = stripeId(session.customer);
      const subscriptionId = stripeId(session.subscription);
      let billingStoreUpdated = false;

      if (email && plan === "pilot") {
        applyPilotCheckout(email, session.id, customerId);
        billingStoreUpdated = true;
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
        billingStoreUpdated = true;
      }

      receipt = {
        eventId: event.id,
        eventType: event.type,
        sessionId: session.id,
        customerId,
        subscriptionId,
        email,
        plan: typeof plan === "string" ? plan : null,
        paymentStatus: session.payment_status ?? null,
        billingStoreUpdated,
        ...backendHandoff(),
      };

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
      receipt = {
        eventId: event.id,
        eventType: event.type,
        sessionId: null,
        customerId: stripeId(invoice.customer),
        subscriptionId: null,
        email: email ?? null,
        plan: null,
        paymentStatus: "failed",
        billingStoreUpdated: Boolean(email),
        ...backendHandoff(),
      };
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = stripeId(subscription.customer);
      console.info("[billing/webhook] subscription.deleted", { customerId });
      receipt = {
        eventId: event.id,
        eventType: event.type,
        sessionId: null,
        customerId,
        subscriptionId: subscription.id,
        email: null,
        plan: null,
        paymentStatus: "canceled",
        billingStoreUpdated: false,
        ...backendHandoff(),
      };
    }
  } catch (error) {
    console.error("[billing/webhook] handler", error);
    return noStoreJson({ error: "Webhook handler error." }, 500);
  }

  return noStoreJson({ received: true, receipt });
}
