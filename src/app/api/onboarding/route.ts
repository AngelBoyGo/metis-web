import { NextResponse } from "next/server";

type OnboardingPayload = {
  company: string;
  primaryContact: string;
  primaryEmail: string;
  billingContact: string;
  billingEmail: string;
  technicalContact: string;
  technicalEmail: string;
  useCase: string;
  volume: string;
  compliance: string;
  timeline: string;
  notes: string;
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePayload(body: unknown): OnboardingPayload | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const company = typeof raw.company === "string" ? raw.company.trim() : "";
  const primaryContact = typeof raw.primaryContact === "string" ? raw.primaryContact.trim() : "";
  const primaryEmail = typeof raw.primaryEmail === "string" ? raw.primaryEmail.trim() : "";
  const billingContact = typeof raw.billingContact === "string" ? raw.billingContact.trim() : "";
  const billingEmail = typeof raw.billingEmail === "string" ? raw.billingEmail.trim() : "";
  const technicalContact =
    typeof raw.technicalContact === "string" ? raw.technicalContact.trim() : "";
  const technicalEmail = typeof raw.technicalEmail === "string" ? raw.technicalEmail.trim() : "";
  const useCase = typeof raw.useCase === "string" ? raw.useCase.trim() : "";
  const volume = typeof raw.volume === "string" ? raw.volume.trim() : "";
  const compliance = typeof raw.compliance === "string" ? raw.compliance.trim() : "";
  const timeline = typeof raw.timeline === "string" ? raw.timeline.trim() : "";
  const notes = typeof raw.notes === "string" ? raw.notes.trim() : "";

  if (
    !company ||
    !primaryContact ||
    !primaryEmail ||
    !billingContact ||
    !billingEmail ||
    !technicalContact ||
    !technicalEmail ||
    !useCase ||
    !volume ||
    !compliance ||
    !timeline
  ) {
    return { error: "All required fields must be completed." };
  }

  if (!isEmail(primaryEmail) || !isEmail(billingEmail) || !isEmail(technicalEmail)) {
    return { error: "Valid email addresses are required for all contacts." };
  }

  if (notes.length > 10000) {
    return { error: "Notes are too long." };
  }

  return {
    company,
    primaryContact,
    primaryEmail,
    billingContact,
    billingEmail,
    technicalContact,
    technicalEmail,
    useCase,
    volume,
    compliance,
    timeline,
    notes,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const validated = validatePayload(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const webhookUrl = process.env.ONBOARDING_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const forward = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          source: "metis.gold-onboarding",
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!forward.ok) {
        return NextResponse.json(
          { error: "Delivery channel unavailable. Please try again later." },
          { status: 502 },
        );
      }

      return NextResponse.json({ ok: true, mode: "webhook" });
    } catch {
      return NextResponse.json(
        { error: "Delivery channel unavailable. Please try again later." },
        { status: 502 },
      );
    }
  }

  console.info("[onboarding] interim receipt", {
    company: validated.company,
    primaryEmail: validated.primaryEmail,
    timeline: validated.timeline,
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    mode: "interim",
    message:
      "Intake logged for interim processing. Email delivery is not yet configured.",
  });
}
