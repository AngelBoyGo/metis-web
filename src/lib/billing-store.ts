export type PaymentState =
  | "quote_requested"
  | "invoice_sent"
  | "payment_pending"
  | "payment_received"
  | "active"
  | "past_due";

export type BillingPlan = "none" | "pilot" | "platform" | "enterprise";

export type BillingRecord = {
  customerEmail: string;
  plan: BillingPlan;
  paymentState: PaymentState;
  contractType: string;
  billingStatus: string;
  invoiceStatus: string;
  paymentStatus: string;
  nextBillingDate: string | null;
  billingContact: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  lastCheckoutSessionId: string | null;
  updatedAt: string;
};

const store = new Map<string, BillingRecord>();

/**
 * Returns billing record for a customer email, creating a default placeholder if absent.
 */
export function getBillingRecord(email: string): BillingRecord {
  const key = email.trim().toLowerCase();
  const existing = store.get(key);
  if (existing) {
    return existing;
  }
  return {
    customerEmail: email,
    plan: "none",
    paymentState: "quote_requested",
    contractType: "none",
    billingStatus: "not_started",
    invoiceStatus: "none",
    paymentStatus: "none",
    nextBillingDate: null,
    billingContact: null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    lastCheckoutSessionId: null,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Persists billing record updates keyed by customer email.
 */
export function upsertBillingRecord(email: string, patch: Partial<BillingRecord>): BillingRecord {
  const key = email.trim().toLowerCase();
  const current = getBillingRecord(email);
  const next: BillingRecord = {
    ...current,
    ...patch,
    customerEmail: email,
    updatedAt: new Date().toISOString(),
  };
  store.set(key, next);
  return next;
}

/**
 * Applies checkout completion to billing state for one-time pilot purchases.
 */
export function applyPilotCheckout(email: string, sessionId: string, customerId: string | null) {
  return upsertBillingRecord(email, {
    plan: "pilot",
    paymentState: "payment_received",
    contractType: "pilot_one_time",
    billingStatus: "active",
    invoiceStatus: "paid",
    paymentStatus: "received",
    nextBillingDate: null,
    stripeCustomerId: customerId,
    lastCheckoutSessionId: sessionId,
  });
}

/**
 * Applies checkout completion to billing state for platform subscriptions.
 */
export function applyPlatformCheckout(
  email: string,
  sessionId: string,
  customerId: string | null,
  subscriptionId: string | null,
  nextBillingDate: string | null,
) {
  return upsertBillingRecord(email, {
    plan: "platform",
    paymentState: "active",
    contractType: "platform_subscription",
    billingStatus: "active",
    invoiceStatus: "current",
    paymentStatus: "current",
    nextBillingDate,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    lastCheckoutSessionId: sessionId,
  });
}

/**
 * Marks subscription as past due after Stripe invoice failure events.
 */
export function applyPastDue(email: string) {
  return upsertBillingRecord(email, {
    paymentState: "past_due",
    billingStatus: "past_due",
    invoiceStatus: "past_due",
    paymentStatus: "past_due",
  });
}
