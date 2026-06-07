export const DIMENSIONS = [
  "simplicity",
  "cost",
  "latency",
  "technicalComplexity",
  "consumerFriendliness",
  "reliability",
  "privacy",
  "deviceCompatibility",
  "codeRequirements",
  "localVsCloud",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

export type WorkloadCategory =
  | "coding_agents"
  | "document_analysis"
  | "device_automation"
  | "customer_support"
  | "general";

export type Budget = "low" | "medium" | "high";
export type Deployment = "local" | "cloud" | "hybrid";

export interface IntentBrief {
  rawText: string;
  category: WorkloadCategory;
  budget: Budget;
  privacyPriority: boolean;
  deployment: Deployment;
  codeComfort: "none" | "some" | "expert";
  hardwareHint?: string;
  keywords: readonly string[];
}

export interface Candidate {
  id: string;
  name: string;
  summary: string;
  hardwareTier: string;
  deployment: Deployment;
  scores: Record<Dimension, number>;
}

export interface Recommendation {
  candidate: Candidate;
  total: number;
  perDimension: Record<Dimension, number>;
  rationale: string[];
}

export interface PlanResult {
  brief: IntentBrief;
  ranked: Recommendation[];
  primaryRecommendationId: string;
  computedHardwareTier: string;
}

const BASE_WEIGHT = 1;

function dimScores(
  simplicity: number,
  cost: number,
  latency: number,
  technicalComplexity: number,
  consumerFriendliness: number,
  reliability: number,
  privacy: number,
  deviceCompatibility: number,
  codeRequirements: number,
  localVsCloud: number,
): Record<Dimension, number> {
  return {
    simplicity,
    cost,
    latency,
    technicalComplexity,
    consumerFriendliness,
    reliability,
    privacy,
    deviceCompatibility,
    codeRequirements,
    localVsCloud,
  };
}

export const CANDIDATE_CATALOG: readonly Candidate[] = [
  {
    id: "metis_core_v1_edge",
    name: "Metis Core V1 Edge Box",
    summary:
      "On-premise edge appliance for low-latency inference with segmented network posture.",
    hardwareTier: "metis_core_v1_edge",
    deployment: "local",
    scores: dimScores(6, 5, 9, 7, 5, 8, 9, 7, 6, 9),
  },
  {
    id: "hosted_cloud_api",
    name: "Hosted Cloud API Tier",
    summary:
      "Managed multi-tenant API endpoint with elastic scaling and standard SLA.",
    hardwareTier: "cloud_managed_api",
    deployment: "cloud",
    scores: dimScores(9, 6, 7, 4, 9, 7, 4, 9, 3, 2),
  },
  {
    id: "on_device_mobile",
    name: "On-Device Mobile Runtime",
    summary:
      "Quantized models running on consumer phones and tablets without network dependency.",
    hardwareTier: "mobile_npu_tier",
    deployment: "local",
    scores: dimScores(8, 8, 8, 5, 10, 6, 8, 10, 4, 8),
  },
  {
    id: "self_hosted_gpu",
    name: "Self-Hosted GPU Cluster",
    summary:
      "Dedicated GPU rack for batch and interactive workloads under operator control.",
    hardwareTier: "gpu_cluster_a100",
    deployment: "hybrid",
    scores: dimScores(4, 3, 8, 9, 3, 9, 7, 5, 9, 7),
  },
  {
    id: "embedded_fpga_basys3",
    name: "Embedded FPGA (Basys3 Class)",
    summary:
      "Deterministic inference on programmable logic for constrained device automation.",
    hardwareTier: "embedded_fpga_basys3",
    deployment: "local",
    scores: dimScores(3, 7, 10, 8, 2, 9, 10, 4, 8, 10),
  },
  {
    id: "rag_document_pipeline",
    name: "RAG Document Pipeline",
    summary:
      "Retrieval-augmented pipeline for regulated document analysis and audit trails.",
    hardwareTier: "rag_hybrid_stack",
    deployment: "hybrid",
    scores: dimScores(5, 5, 6, 7, 6, 8, 8, 7, 6, 6),
  },
  {
    id: "support_routing_classifier",
    name: "Support Routing Classifier",
    summary:
      "Lightweight intent classifier for ticket triage and first-response routing.",
    hardwareTier: "classifier_microservice",
    deployment: "cloud",
    scores: dimScores(9, 9, 7, 3, 8, 7, 5, 8, 2, 3),
  },
];

const CATEGORY_KEYWORDS: Record<WorkloadCategory, RegExp[]> = {
  coding_agents: [
    /\b(cod(e|ing)|agent|ide|developer|programming|repo|git)\b/i,
  ],
  document_analysis: [
    /\b(document|pdf|hipaa|phi|medical|health|clinical|record|compliance)\b/i,
  ],
  device_automation: [
    /\b(wearable|smart[\s-]?home|iot|sensor|embedded|fpga|device|automation)\b/i,
  ],
  customer_support: [
    /\b(support|ticket|customer|helpdesk|routing|chatbot|call[\s-]?center)\b/i,
  ],
  general: [],
};

const BUDGET_LOW = /\b(cheap|low[\s-]?cost|budget|affordable|minimal|free)\b/i;
const BUDGET_HIGH = /\b(enterprise|premium|high[\s-]?end|unlimited|scale)\b/i;
const PRIVACY =
  /\b(private|privacy|hipaa|phi|secure|on[\s-]?prem|air[\s-]?gap|confidential)\b/i;
const LOCAL = /\b(local|on[\s-]?prem|edge|offline|self[\s-]?host)\b/i;
const CLOUD = /\b(cloud|saas|hosted|api|managed)\b/i;
const CODE_NONE = /\b(no[\s-]?code|non[\s-]?technical|simple|easy)\b/i;
const CODE_EXPERT = /\b(expert|engineer|developer|custom|kernel|cuda)\b/i;

function extractKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out.slice(0, 12);
}

function detectCategory(text: string): WorkloadCategory {
  let best: WorkloadCategory = "general";
  let bestScore = 0;
  for (const [cat, patterns] of Object.entries(CATEGORY_KEYWORDS) as [
    WorkloadCategory,
    RegExp[],
  ][]) {
    if (cat === "general") continue;
    const score = patterns.reduce(
      (n, re) => n + (re.test(text) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return best;
}

export function fallbackParse(rawText: string): IntentBrief {
  const text = rawText.trim();
  const category = detectCategory(text);
  let budget: Budget = "medium";
  if (BUDGET_LOW.test(text)) budget = "low";
  else if (BUDGET_HIGH.test(text)) budget = "high";

  let deployment: Deployment = "hybrid";
  if (LOCAL.test(text) && !CLOUD.test(text)) deployment = "local";
  else if (CLOUD.test(text) && !LOCAL.test(text)) deployment = "cloud";

  let codeComfort: IntentBrief["codeComfort"] = "some";
  if (CODE_NONE.test(text)) codeComfort = "none";
  else if (CODE_EXPERT.test(text)) codeComfort = "expert";

  const hardwareMatch = text.match(
    /\b(fpga|basys|gpu|a100|mobile|edge|npu|arm|raspberry)\b/i,
  );

  return {
    rawText: text,
    category,
    budget,
    privacyPriority: PRIVACY.test(text),
    deployment,
    codeComfort,
    hardwareHint: hardwareMatch ? hardwareMatch[0].toLowerCase() : undefined,
    keywords: extractKeywords(text),
  };
}

export function deriveWeights(brief: IntentBrief): Record<Dimension, number> {
  const w: Record<Dimension, number> = {
    simplicity: BASE_WEIGHT,
    cost: BASE_WEIGHT,
    latency: BASE_WEIGHT,
    technicalComplexity: BASE_WEIGHT,
    consumerFriendliness: BASE_WEIGHT,
    reliability: BASE_WEIGHT,
    privacy: BASE_WEIGHT,
    deviceCompatibility: BASE_WEIGHT,
    codeRequirements: BASE_WEIGHT,
    localVsCloud: BASE_WEIGHT,
  };

  if (brief.privacyPriority) {
    w.privacy += 2;
    w.localVsCloud += 2;
  }

  if (brief.budget === "low") w.cost += 2;
  if (brief.budget === "high") {
    w.reliability += 1.5;
    w.technicalComplexity += 1;
  }

  if (brief.codeComfort === "none") {
    w.simplicity += 2;
    w.consumerFriendliness += 1.5;
    w.codeRequirements -= 1;
  } else if (brief.codeComfort === "expert") {
    w.technicalComplexity += 1.5;
    w.codeRequirements += 1;
  }

  if (brief.deployment === "local") w.localVsCloud += 2;
  if (brief.deployment === "cloud") {
    w.simplicity += 1;
    w.localVsCloud -= 1;
  }

  switch (brief.category) {
    case "coding_agents":
      w.technicalComplexity += 1.5;
      w.latency += 1;
      w.codeRequirements += 1;
      break;
    case "document_analysis":
      w.privacy += 1.5;
      w.reliability += 1;
      break;
    case "device_automation":
      w.latency += 2;
      w.deviceCompatibility += 1.5;
      w.localVsCloud += 1;
      break;
    case "customer_support":
      w.cost += 1.5;
      w.simplicity += 1;
      w.consumerFriendliness += 1;
      break;
    default:
      break;
  }

  if (brief.hardwareHint?.includes("fpga")) {
    w.latency += 1;
    w.localVsCloud += 1;
  }

  for (const d of DIMENSIONS) {
    if (w[d] < 0.25) w[d] = 0.25;
  }

  return w;
}

function buildRationale(
  brief: IntentBrief,
  candidate: Candidate,
  perDimension: Record<Dimension, number>,
  weights: Record<Dimension, number>,
): string[] {
  const lines: string[] = [];
  lines.push(
    `Matched workload category "${brief.category.replace(/_/g, " ")}" against ${candidate.name}.`,
  );

  if (brief.privacyPriority && candidate.scores.privacy >= 7) {
    lines.push("Privacy priority aligned with strong on-premise posture.");
  }
  if (brief.budget === "low" && candidate.scores.cost >= 7) {
    lines.push("Low budget tilt favored cost-efficient deployment.");
  }
  if (brief.deployment === "local" && candidate.deployment !== "cloud") {
    lines.push("Local deployment preference matched edge or hybrid topology.");
  }

  let topDim: Dimension = DIMENSIONS[0];
  let topVal = 0;
  for (const d of DIMENSIONS) {
    const v = perDimension[d] * weights[d];
    if (v > topVal) {
      topVal = v;
      topDim = d;
    }
  }
  lines.push(
    `Strongest weighted dimension: ${topDim.replace(/([A-Z])/g, " $1").toLowerCase().trim()}.`,
  );

  return lines;
}

export function scorePlan(brief: IntentBrief): PlanResult {
  const weights = deriveWeights(brief);
  const weightSum = DIMENSIONS.reduce((s, d) => s + weights[d], 0);

  const ranked: Recommendation[] = CANDIDATE_CATALOG.map((candidate) => {
    const perDimension = { ...candidate.scores };
    let total = 0;
    for (const d of DIMENSIONS) {
      total += (perDimension[d] * weights[d]) / weightSum;
    }
    return {
      candidate,
      total: Math.round(total * 100) / 100,
      perDimension,
      rationale: buildRationale(brief, candidate, perDimension, weights),
    };
  }).sort((a, b) => b.total - a.total);

  const primary = ranked[0];
  return {
    brief,
    ranked,
    primaryRecommendationId: primary.candidate.id,
    computedHardwareTier: primary.candidate.hardwareTier,
  };
}
