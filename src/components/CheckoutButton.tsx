"use client";

import { useState } from "react";
import type { CheckoutPlan } from "@/lib/stripe-config";

type Props = {
  plan: CheckoutPlan;
  label: string;
  lang: string;
  className?: string;
};

/**
 * Starts Stripe Checkout for pilot or platform plans.
 */
export default function CheckoutButton({ plan, label, lang, className = "btn-primary" }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, lang }),
      });
      const body = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !body.url) {
        setError(body.error ?? "Checkout unavailable. Contact billing.");
        return;
      }
      window.location.href = body.url;
    } catch {
      setError("Network error. Try again or contact billing.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="checkout-action">
      <button
        type="button"
        className={className}
        onClick={() => void handleCheckout()}
        disabled={pending}
      >
        {pending ? "Redirecting…" : label}
      </button>
      {error ? (
        <p className="briefing-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
