import { NextResponse } from "next/server";

const CATEGORIES = ["government", "healthcare", "research", "partnership"] as const;

type BriefingPayload = {
  name: string;
  organization: string;
  role: string;
  email: string;
  category: string;
  topic: string;
  message: string;
};

function validatePayload(body: unknown): BriefingPayload | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }

  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const organization = typeof raw.organization === "string" ? raw.organization.trim() : "";
  const role = typeof raw.role === "string" ? raw.role.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const category = typeof raw.category === "string" ? raw.category.trim() : "";
  const topic = typeof raw.topic === "string" ? raw.topic.trim() : "";
  const message = typeof raw.message === "string" ? raw.message.trim() : "";

  if (!name || !organization || !role || !email || !category || !topic || !message) {
    return { error: "All fields are required." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email address is required." };
  }

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return { error: "Invalid category." };
  }

  if (message.length > 10000) {
    return { error: "Message is too long." };
  }

  return { name, organization, role, email, category, topic, message };
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

  const webhookUrl = process.env.BRIEFING_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const forward = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validated,
          source: "metis.gold-briefing",
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

  console.info("[briefing] interim receipt", {
    organization: validated.organization,
    category: validated.category,
    topic: validated.topic,
    at: new Date().toISOString(),
  });

  return NextResponse.json({
    ok: true,
    mode: "interim",
    message:
      "Request logged for interim processing. Email delivery is not yet configured.",
  });
}
