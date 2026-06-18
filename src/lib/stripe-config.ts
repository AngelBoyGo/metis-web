import Stripe from "stripe";

export type CheckoutPlan = "pilot" | "platform";

/**
 * Resolves Stripe restricted secret key from environment.
 */
export function getStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key || null;
}

/**
 * Returns configured Stripe client or null when key is missing.
 */
export function getStripeClient(): Stripe | null {
  const key = getStripeSecretKey();
  if (!key) {
    return null;
  }
  return new Stripe(key, { apiVersion: "2025-08-27.basil" });
}

/**
 * Resolves Stripe price id for pilot or platform checkout.
 */
export function getPriceId(plan: CheckoutPlan): string | null {
  if (plan === "pilot") {
    return process.env.STRIPE_PILOT_PRICE_ID?.trim() || null;
  }
  return process.env.STRIPE_PLATFORM_PRICE_ID?.trim() || null;
}

/**
 * Builds absolute site URL for Stripe redirect targets.
 */
export function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return "https://metis.gold";
}
