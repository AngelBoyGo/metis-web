"use client";

import { useState } from "react";
import type { SiteContent } from "@/content/i18n/types";

type FormState = "idle" | "submitting" | "success" | "interim" | "error";

type OnboardingFormProps = {
  form: SiteContent["startPilot"]["form"];
  errors: SiteContent["startPilot"]["errors"];
  confirmation: SiteContent["startPilot"]["confirmation"];
};

/**
 * Pilot intake form with confirmation state after submission.
 */
export default function OnboardingForm({ form, errors, confirmation }: OnboardingFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage(null);

    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    const payload = {
      company: String(data.get("company") ?? "").trim(),
      primaryContact: String(data.get("primaryContact") ?? "").trim(),
      primaryEmail: String(data.get("primaryEmail") ?? "").trim(),
      billingContact: String(data.get("billingContact") ?? "").trim(),
      billingEmail: String(data.get("billingEmail") ?? "").trim(),
      technicalContact: String(data.get("technicalContact") ?? "").trim(),
      technicalEmail: String(data.get("technicalEmail") ?? "").trim(),
      useCase: String(data.get("useCase") ?? "").trim(),
      volume: String(data.get("volume") ?? "").trim(),
      compliance: String(data.get("compliance") ?? "").trim(),
      timeline: String(data.get("timeline") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { ok?: boolean; mode?: string; error?: string };

      if (!res.ok) {
        setState("error");
        setErrorMessage(body.error ?? errors.compileFailed);
        return;
      }

      if (body.mode === "webhook") {
        setState("success");
      } else {
        setState("interim");
      }
      formEl.reset();
    } catch {
      setState("error");
      setErrorMessage(errors.network);
    }
  }

  if (state === "success" || state === "interim") {
    return (
      <div
        className={`briefing-status ${state === "success" ? "briefing-status-success" : "briefing-status-interim"}`}
        role="status"
      >
        <p className="briefing-status-title">
          {state === "success" ? form.successTitle : form.interimTitle}
        </p>
        <p>{state === "success" ? form.successBody : form.interimBody}</p>
        <section className="onboarding-confirmation">
          <h2 className="support-section-title font-serif">{confirmation.title}</h2>
          <ol className="steps-list">
            {confirmation.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h3 className="support-section-title font-serif">Prepare for kickoff</h3>
          <ul className="bullet-list">
            {confirmation.prepare.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="contact-response font-mono">{confirmation.sla}</p>
          <p className="support-prose">{confirmation.contact}</p>
        </section>
      </div>
    );
  }

  return (
    <form className="briefing-form onboarding-form" onSubmit={handleSubmit} noValidate>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-company">{form.companyLabel}</label>
        <input id="onboarding-company" name="company" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-primary-contact">{form.primaryContactLabel}</label>
        <input id="onboarding-primary-contact" name="primaryContact" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-primary-email">{form.primaryEmailLabel}</label>
        <input id="onboarding-primary-email" name="primaryEmail" type="email" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-billing-contact">{form.billingContactLabel}</label>
        <input id="onboarding-billing-contact" name="billingContact" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-billing-email">{form.billingEmailLabel}</label>
        <input id="onboarding-billing-email" name="billingEmail" type="email" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-technical-contact">{form.technicalContactLabel}</label>
        <input id="onboarding-technical-contact" name="technicalContact" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-technical-email">{form.technicalEmailLabel}</label>
        <input id="onboarding-technical-email" name="technicalEmail" type="email" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-use-case">{form.useCaseLabel}</label>
        <textarea id="onboarding-use-case" name="useCase" rows={3} required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-volume">{form.volumeLabel}</label>
        <input id="onboarding-volume" name="volume" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-compliance">{form.complianceLabel}</label>
        <textarea id="onboarding-compliance" name="compliance" rows={3} required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-timeline">{form.timelineLabel}</label>
        <input id="onboarding-timeline" name="timeline" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="onboarding-notes">{form.notesLabel}</label>
        <textarea id="onboarding-notes" name="notes" rows={4} />
      </div>
      {state === "error" && errorMessage ? (
        <p className="briefing-form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        className="briefing-form-submit"
        disabled={state === "submitting"}
      >
        {state === "submitting" ? form.submitting : form.submitLabel}
      </button>
    </form>
  );
}
