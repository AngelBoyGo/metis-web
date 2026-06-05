"use client";

import { useState } from "react";
import { contact } from "@/content/site";

type FormState = "idle" | "submitting" | "success" | "interim" | "error";

export default function BriefingForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
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
        setErrorMessage(body.error ?? "Unable to submit request.");
        return;
      }

      if (body.mode === "webhook") {
        setState("success");
      } else {
        setState("interim");
      }
      form.reset();
    } catch {
      setState("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (state === "success") {
    return (
      <div className="briefing-status briefing-status-success" role="status">
        <p className="briefing-status-title">{contact.form.successTitle}</p>
        <p>{contact.form.successBody}</p>
      </div>
    );
  }

  if (state === "interim") {
    return (
      <div className="briefing-status briefing-status-interim" role="status">
        <p className="briefing-status-title">{contact.form.interimTitle}</p>
        <p>{contact.form.interimBody}</p>
      </div>
    );
  }

  const { form } = contact;

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
            Select category
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
        {state === "submitting" ? "Submitting…" : form.submitLabel}
      </button>
    </form>
  );
}
