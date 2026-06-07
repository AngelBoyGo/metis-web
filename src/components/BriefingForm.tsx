"use client";

import { useState } from "react";
import type { SiteContent } from "@/content/i18n/types";

type FormState = "idle" | "submitting" | "success" | "interim" | "error";

type BriefingFormProps = {
  form: SiteContent["contact"]["form"];
  errors: SiteContent["contact"]["errors"];
};

export default function BriefingForm({ form, errors }: BriefingFormProps) {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage(null);

    const formEl = event.currentTarget;
    const data = new FormData(formEl);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      organization: String(data.get("organization") ?? "").trim(),
      role: String(data.get("role") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      category: String(data.get("category") ?? "").trim(),
      topic: String(data.get("topic") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    try {
      const res = await fetch("/api/briefing", {
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

  if (state === "success") {
    return (
      <div className="briefing-status briefing-status-success" role="status">
        <p className="briefing-status-title">{form.successTitle}</p>
        <p>{form.successBody}</p>
      </div>
    );
  }

  if (state === "interim") {
    return (
      <div className="briefing-status briefing-status-interim" role="status">
        <p className="briefing-status-title">{form.interimTitle}</p>
        <p>{form.interimBody}</p>
      </div>
    );
  }

  return (
    <form className="briefing-form" onSubmit={handleSubmit} noValidate>
      <div className="briefing-form-row">
        <label htmlFor="briefing-name">{form.nameLabel}</label>
        <input id="briefing-name" name="name" type="text" required autoComplete="name" />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="briefing-organization">{form.organizationLabel}</label>
        <input
          id="briefing-organization"
          name="organization"
          type="text"
          required
          autoComplete="organization"
        />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="briefing-role">{form.roleLabel}</label>
        <input id="briefing-role" name="role" type="text" required autoComplete="organization-title" />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="briefing-email">{form.emailLabel}</label>
        <input id="briefing-email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="briefing-category">{form.categoryLabel}</label>
        <select id="briefing-category" name="category" required defaultValue="">
          <option value="" disabled>
            {form.selectCategory}
          </option>
          {form.categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="briefing-form-row">
        <label htmlFor="briefing-topic">{form.topicLabel}</label>
        <input id="briefing-topic" name="topic" type="text" required />
      </div>
      <div className="briefing-form-row">
        <label htmlFor="briefing-message">{form.messageLabel}</label>
        <textarea id="briefing-message" name="message" rows={5} required />
      </div>
      {state === "error" && errorMessage && (
        <p className="briefing-form-error" role="alert">
          {errorMessage}
        </p>
      )}
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
