import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import Stripe from "stripe";
import {
  applyPastDue,
  applyPilotCheckout,
  applyPlatformCheckout,
} from "@/lib/billing-store";
import { currentBillingCycle, upsertBillingInvoice } from "../reconciliation-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebhookReceipt = {
  eventId: string;
  eventType: string;
  sessionId: string | null;
  invoiceId: string | null;
  customerId: string | null;
  subscriptionId: string | null;
  amountTotal: number | null;
  email: string | null;
  plan: string | null;
  paymentStatus: string | null;
  billingStoreUpdated: boolean;
  fulfillment: FulfillmentReceipt;
  checkoutSession: CheckoutSessionPayload | null;
};

type CheckoutSessionPayload = {
  id: string;
  customer: string | null;
  customer_details: { email: string | null };
  amount_total: number | null;
  payment_status: string | null;
  invoice: string | null;
  subscription: string | null;
  metadata: Stripe.Metadata | null;
};

type FulfillmentReceipt = {
  forwarded: boolean;
  reason: string | null;
  endpoint: string | null;
  status: number | null;
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

function fulfillmentEndpoint(): string | null {
  const target = readEnv("INTERNAL_API_URL") ?? readEnv("FASTAPI_PROXY_TARGET");
  return target ? `${target.replace(/\/$/, "")}/api/billing/fulfill` : null;
}

function fulfillmentSecret(): string | null {
  return readEnv("METIS_FULFILLMENT_SECRET") ?? readEnv("BILLING_FULFILLMENT_SECRET");
}

function fulfillmentSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

function checkoutSessionPayload(session: Stripe.Checkout.Session): CheckoutSessionPayload {
  return {
    id: session.id,
    customer: stripeId(session.customer),
    customer_details: {
      email: session.customer_details?.email ?? session.customer_email ?? session.metadata?.email ?? null,
    },
    amount_total: session.amount_total ?? null,
    payment_status: session.payment_status ?? null,
    invoice: stripeId(session.invoice),
    subscription: stripeId(session.subscription),
    metadata: session.metadata ?? null,
  };
}

async function forwardFulfillment(
  payload: string,
  event: Stripe.Event,
  signature: string,
): Promise<FulfillmentReceipt> {
  const endpoint = fulfillmentEndpoint();
  if (!endpoint) {
    return {
      forwarded: false,
      reason: "FULFILLMENT_ENDPOINT_UNCONFIGURED",
      endpoint: null,
      status: null,
    };
  }

  const secret = fulfillmentSecret();
  if (!secret) {
    return {
      forwarded: false,
      reason: "FULFILLMENT_SIGNATURE_UNCONFIGURED",
      endpoint,
      status: 503,
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Stripe-Signature": signature,
      "X-Stripe-Event-Id": event.id,
      "X-Stripe-Event-Type": event.type,
      "X-Metis-Fulfillment-Signature": fulfillmentSignature(payload, secret),
    },
    body: payload,
    cache: "no-store",
  });

  return {
    forwarded: response.ok,
    reason: response.ok ? null : "BACKEND_FULFILLMENT_REJECTED",
    endpoint,
    status: response.status,
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

  let fulfillment: FulfillmentReceipt;

  try {
    fulfillment = await forwardFulfillment(payload, event, signature);
  } catch (error) {
    console.error("[billing/webhook] fulfillment", error);
    fulfillment = {
      forwarded: false,
      reason: "BACKEND_FULFILLMENT_ERROR",
      endpoint: fulfillmentEndpoint(),
      status: null,
    };
  }

  if (fulfillment.reason === "FULFILLMENT_SIGNATURE_UNCONFIGURED") {
    return noStoreJson({ received: false, receipt: { fulfillment } }, 503);
  }

  let receipt: WebhookReceipt | null = null;

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const flatSession = checkoutSessionPayload(session);
      const email = flatSession.customer_details.email;
      const plan = session.metadata?.plan;
      const customerId = flatSession.customer;
      const subscriptionId = flatSession.subscription;
      let billingStoreUpdated = false;

      if (email && plan === "pilot") {
        applyPilotCheckout(email, session.id, customerId);
        upsertBillingInvoice(email, {
          invoiceId: flatSession.invoice ?? flatSession.id,
          billingCycle: currentBillingCycle(),
          amountPaid: flatSession.amount_total ?? 0,
          tierTierSlug: "pilot",
          status: "PAID",
          sessionId: flatSession.id,
          subscriptionId,
          customerId,
        });
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
        upsertBillingInvoice(email, {
          invoiceId: flatSession.invoice ?? flatSession.id,
          billingCycle: currentBillingCycle(),
          amountPaid: flatSession.amount_total ?? 0,
          tierTierSlug: "platform",
          status: "PAID",
          sessionId: flatSession.id,
          subscriptionId,
          customerId,
        });
        billingStoreUpdated = true;
      }

      receipt = {
        eventId: event.id,
        eventType: event.type,
        sessionId: session.id,
        invoiceId: flatSession.invoice,
        customerId,
        subscriptionId,
        amountTotal: flatSession.amount_total,
        email,
        plan: typeof plan === "string" ? plan : null,
        paymentStatus: flatSession.payment_status,
        billingStoreUpdated,
        fulfillment,
        checkoutSession: flatSession,
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
        invoiceId: invoice.id ?? null,
        customerId: stripeId(invoice.customer),
        subscriptionId: null,
        amountTotal: invoice.amount_paid ?? null,
        email: email ?? null,
        plan: null,
        paymentStatus: "failed",
        billingStoreUpdated: Boolean(email),
        fulfillment,
        checkoutSession: null,
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
        invoiceId: null,
        customerId,
        subscriptionId: subscription.id,
        amountTotal: null,
        email: null,
        plan: null,
        paymentStatus: "canceled",
        billingStoreUpdated: false,
        fulfillment,
        checkoutSession: null,
      };
    }
  } catch (error) {
    console.error("[billing/webhook] handler", error);
    return noStoreJson({ error: "Webhook handler error." }, 500);
  }

  return noStoreJson({ received: true, receipt });
}
