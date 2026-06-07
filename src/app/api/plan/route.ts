import { NextResponse } from "next/server";
import {
  fallbackParse,
  scorePlan,
  type IntentBrief,
  type PlanResult,
  type WorkloadCategory,
  type Budget,
  type Deployment,
} from "@/utils/plannerEngine";

type PlanPayload = { text: string };

const VALID_CATEGORIES: WorkloadCategory[] = [
  "coding_agents",
  "document_analysis",
  "device_automation",
  "customer_support",
  "general",
];
const VALID_BUDGETS: Budget[] = ["low", "medium", "high"];
const VALID_DEPLOYMENTS: Deployment[] = ["local", "cloud", "hybrid"];
const VALID_CODE = ["none", "some", "expert"] as const;

function validateText(body: unknown): PlanPayload | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body." };
  }
  const raw = body as Record<string, unknown>;
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  if (!text) {
    return { error: "Text field is required." };
  }
  if (text.length > 10000) {
    return { error: "Text exceeds maximum length." };
  }
  return { text };
}

function normalizeBrief(parsed: Partial<IntentBrief>, rawText: string): IntentBrief {
  const category = VALID_CATEGORIES.includes(parsed.category as WorkloadCategory)
    ? (parsed.category as WorkloadCategory)
    : "general";
  const budget = VALID_BUDGETS.includes(parsed.budget as Budget)
    ? (parsed.budget as Budget)
    : "medium";
  const deployment = VALID_DEPLOYMENTS.includes(parsed.deployment as Deployment)
    ? (parsed.deployment as Deployment)
    : "hybrid";
  const codeComfort = VALID_CODE.includes(
    parsed.codeComfort as (typeof VALID_CODE)[number],
  )
    ? (parsed.codeComfort as IntentBrief["codeComfort"])
    : "some";

  return {
    rawText,
    category,
    budget,
    privacyPriority: Boolean(parsed.privacyPriority),
    deployment,
    codeComfort,
    hardwareHint:
      typeof parsed.hardwareHint === "string" ? parsed.hardwareHint : undefined,
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.filter((k): k is string => typeof k === "string").slice(0, 12)
      : [],
  };
}

function extractJsonFromContent(content: string): Partial<IntentBrief> | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as Partial<IntentBrief>;
  } catch {
    return null;
  }
}

async function parseWithOpenAI(text: string, apiKey: string): Promise<IntentBrief | null> {
  const systemPrompt = `Extract intent as strict JSON only. Fields: category (coding_agents|document_analysis|device_automation|customer_support|general), budget (low|medium|high), privacyPriority (boolean), deployment (local|cloud|hybrid), codeComfort (none|some|expert), hardwareHint (string or null), keywords (string array max 12). No prose outside JSON.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;
  const parsed = extractJsonFromContent(content);
  if (!parsed) return null;
  return normalizeBrief(parsed, text);
}

async function parseWithGemini(text: string, apiKey: string): Promise<IntentBrief | null> {
  const systemPrompt = `Extract intent as strict JSON only. Fields: category (coding_agents|document_analysis|device_automation|customer_support|general), budget (low|medium|high), privacyPriority (boolean), deployment (local|cloud|hybrid), codeComfort (none|some|expert), hardwareHint (string or null), keywords (string array max 12). Return JSON object only.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 512 },
      }),
    },
  );

  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) return null;
  const parsed = extractJsonFromContent(content);
  if (!parsed) return null;
  return normalizeBrief(parsed, text);
}

async function parseWithAnthropic(text: string, apiKey: string): Promise<IntentBrief | null> {
  const systemPrompt = `Extract intent as strict JSON only. Fields: category (coding_agents|document_analysis|device_automation|customer_support|general), budget (low|medium|high), privacyPriority (boolean), deployment (local|cloud|hybrid), codeComfort (none|some|expert), hardwareHint (string or null), keywords (string array max 12). Return JSON object only.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const content = data.content?.find((c) => c.type === "text")?.text;
  if (!content) return null;
  const parsed = extractJsonFromContent(content);
  if (!parsed) return null;
  return normalizeBrief(parsed, text);
}

async function parseIntent(text: string): Promise<IntentBrief> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    const brief = await parseWithOpenAI(text, openaiKey);
    if (brief) return brief;
  }
  if (anthropicKey) {
    const brief = await parseWithAnthropic(text, anthropicKey);
    if (brief) return brief;
  }
  if (geminiKey) {
    const brief = await parseWithGemini(text, geminiKey);
    if (brief) return brief;
  }
  return fallbackParse(text);
}

function hashSession(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `anon_${Math.abs(h).toString(16).slice(0, 8)}`;
}

type TelemetryEvent = {
  timestamp: string;
  session_id: string;
  parsed_workload_category: string;
  computed_hardware_tier: string;
  primary_recommendation_id: string;
  export_format_requested: string | null;
};

function emitTelemetry(event: TelemetryEvent): void {
  console.log(JSON.stringify(event));
}

async function forwardTelemetry(event: TelemetryEvent): Promise<void> {
  const url = process.env.PLAN_TELEMETRY_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    /* webhook forward is best-effort */
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const validated = validateText(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const brief = await parseIntent(validated.text);
  const result: PlanResult = scorePlan(brief);

  const exportFormat =
    body &&
    typeof body === "object" &&
    typeof (body as Record<string, unknown>).exportFormat === "string"
      ? ((body as Record<string, unknown>).exportFormat as string)
      : null;

  const telemetry: TelemetryEvent = {
    timestamp: new Date().toISOString(),
    session_id: hashSession(validated.text),
    parsed_workload_category: result.brief.category,
    computed_hardware_tier: result.computedHardwareTier,
    primary_recommendation_id: result.primaryRecommendationId,
    export_format_requested: exportFormat,
  };

  emitTelemetry(telemetry);
  await forwardTelemetry(telemetry);

  return NextResponse.json(result);
}
