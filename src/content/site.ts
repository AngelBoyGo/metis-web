export const company = {
  name: "Metis LLC",
  tagline: "AI systems, secure compute, and cyber resilience",
  oneLiner:
    "Metis LLC designs advanced AI systems, secure compute architectures, and public-sector technology strategies for healthcare and critical infrastructure organizations.",
  address: {
    street: "1172 S Dixie Hwy",
    city: "Coral Gables",
    state: "FL",
    postal: "33146",
    country: "United States",
    formatted:
      "1172 S Dixie Hwy, Coral Gables, FL 33146, United States",
  },
  variants: {
    publicSector:
      "Technology advisory and secure systems design for government and regulated environments.",
    healthcare:
      "AI systems architecture and cyber resilience for clinical and health informatics operations.",
    technical:
      "Secure compute, infrastructure design, and applied research for critical operational environments.",
  },
} as const;

export const hero = {
  eyebrow: "Metis LLC",
  headline:
    "AI systems, secure compute, and cyber resilience for critical operations",
  description: company.oneLiner,
} as const;

export const overview = {
  title: "Institutional overview",
  paragraphs: [
    "Metis LLC is a technology firm focused on AI systems architecture, secure compute, and cyber resilience for healthcare and other critical operational environments.",
    "We work with public-sector and regulated organizations that require disciplined engineering, clear documentation, and accountable engagement models—not speculative demos or theatrical interfaces.",
    "Our practice combines applied research, infrastructure design, and advisory services grounded in peer-reviewed evidence and operational reality.",
  ],
} as const;

export type CapabilityCategory = {
  id: string;
  title: string;
  summary: string;
  items: readonly string[];
};

export const capabilities = {
  title: "Capabilities",
  intro:
    "Metis delivers structured technical and advisory services across three practice areas.",
  categories: [
    {
      id: "ai-systems",
      title: "AI systems architecture",
      summary:
        "Design and evaluation of AI-enabled workflows, model integration, and operational guardrails for regulated environments.",
      items: [
        "System design and architecture reviews",
        "Model integration and workflow mapping",
        "Operational guardrails and monitoring posture",
        "Documentation for procurement and compliance reviewers",
      ],
    },
    {
      id: "secure-compute",
      title: "Secure compute & infrastructure",
      summary:
        "Infrastructure design emphasizing resilience, segmentation, and accountable operations.",
      items: [
        "Compute and network architecture planning",
        "Resilience and segmentation design",
        "Incident-response-informed infrastructure posture",
        "Technical documentation for stakeholders",
      ],
    },
    {
      id: "cyber-resilience",
      title: "Cyber resilience advisory",
      summary:
        "Evidence-informed advisory on ransomware impacts, informatics continuity, and systemic risk in healthcare operations.",
      items: [
        "Threat-informed architecture advisory",
        "Informatics continuity and operational impact analysis",
        "Research-informed policy and engineering briefings",
        "Public-sector and healthcare engagement support",
      ],
    },
  ] as const satisfies readonly CapabilityCategory[],
  engagementModels: {
    title: "Engagement models",
    items: [
      {
        name: "Advisory briefing",
        description:
          "Structured discussion of scope, constraints, and fit—typically the first step for new inquiries.",
      },
      {
        name: "Architecture review",
        description:
          "Focused technical review of systems, documentation, and resilience posture.",
      },
      {
        name: "Research collaboration",
        description:
          "Applied research support aligned with published work and documented methodologies.",
      },
      {
        name: "Procurement support",
        description:
          "Capability statements, document packages, and factual materials for reviewers.",
      },
    ],
  },
} as const;

export const whyMetis = {
  title: "Why Metis",
  points: [
    {
      title: "Evidence-grounded practice",
      body: "Our advisory work is informed by peer-reviewed research, including published analysis of ransomware impacts on healthcare informatics and operations.",
    },
    {
      title: "Operational focus",
      body: "We emphasize systems that must function under stress—clinical workflows, public-sector constraints, and accountable documentation.",
    },
    {
      title: "Clear engagement",
      body: "Defined scopes, honest timelines, and materials suitable for procurement and compliance reviewers—without overstated claims.",
    },
    {
      title: "Disciplined communication",
      body: "Institutional presentation, factual copy, and direct channels—no simulated dashboards or theatrical interfaces.",
    },
  ],
} as const;

export const leadership = {
  name: "Ishmael A. Avery",
  title: "Founder & Principal Investigator",
  bio: "Ishmael A. Avery is Founder and Principal Investigator of Metis LLC. His work focuses on AI systems architecture, compute infrastructure, and cyber resilience in healthcare and other critical operational environments.",
  focusAreas: [
    "AI systems architecture",
    "Secure compute and infrastructure design",
    "Cyber resilience in healthcare and critical operations",
    "Applied research and evidence-informed advisory",
  ],
  researchAnchor: {
    label: "Published research",
    citation:
      "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients (JMIR, 2025)",
    doi: "10.2196/59231",
    url: "https://doi.org/10.2196/59231",
  },
  location: company.address.formatted,
  links: [
    { label: "Research", href: "/research" },
    { label: "Capabilities", href: "/capabilities" },
    { label: "Request briefing", href: "/contact" },
  ],
} as const;

export const research = {
  title: "Research",
  publication: {
    title:
      "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
    journal: "Journal of Medical Internet Research",
    date: "April 8, 2025",
    doi: "10.2196/59231",
    url: "https://doi.org/10.2196/59231",
  },
  summary:
    "A systematic media literature review examining how ransomware incidents are portrayed across clinical informatics, workforce operations, and patient safety contexts.",
  whyItMatters:
    "The findings document how infrastructure failures cascade through healthcare systems—informing threat modeling, resilience planning, and architecture decisions for organizations that cannot treat cyber incidents as isolated IT events.",
  relatedDirections: [
    "Healthcare informatics continuity under systemic disruption",
    "Media framing and public understanding of operational cyber risk",
    "Architecture and policy implications for regulated environments",
  ],
} as const;

export const publicSector = {
  title: "Public sector engagement",
  intro:
    "Metis supports government and regulated organizations with technology strategy, secure systems design, and evidence-informed advisory.",
  services: [
    "Capability statements and procurement-ready documentation",
    "Architecture and resilience reviews for critical systems",
    "Briefings grounded in published research and operational analysis",
    "Structured engagement for healthcare and public-sector contexts",
  ],
  howEngagementsBegin: {
    title: "How engagements begin",
    steps: [
      "Submit a briefing request with organization, role, and topic.",
      "Initial review within two business days.",
      "Structured discovery call to assess scope and fit.",
      "Proposal or statement of work for aligned engagements.",
      "Delivery under agreed terms with documented outputs.",
    ],
  },
} as const;

export const security = {
  title: "Security & confidentiality",
  statements: [
    "Metis treats client and inquiry information with appropriate care and does not publish confidential materials without explicit agreement.",
    "Briefing requests are handled through controlled channels; delivery infrastructure is configured per engagement requirements.",
    "We do not claim certifications or endorsements not documented in writing.",
    "Technical recommendations are scoped to stated constraints and reviewed for accuracy before delivery.",
  ],
} as const;

export type DocumentCard = {
  id: string;
  name: string;
  version: string;
  audience: string;
  description: string;
  availability: "download" | "on-request";
  href?: string;
};

export const documents = {
  title: "Documents",
  intro:
    "Procurement and briefing materials for reviewers and partners.",
  cards: [
    {
      id: "capability-statement",
      name: "Metis Capability Statement",
      version: "Current",
      audience: "Procurement, partners, technical reviewers",
      description:
        "Overview of Metis LLC capabilities, engagement models, and contact information.",
      availability: "download",
      href: "/documents/METIS_Capability_Statement.pdf",
    },
    {
      id: "research-brief",
      name: "Research Brief",
      version: "On request",
      audience: "Research and policy stakeholders",
      description:
        "Summary materials related to published research and applied directions.",
      availability: "on-request",
    },
    {
      id: "public-sector-overview",
      name: "Public Sector Overview",
      version: "On request",
      audience: "Government and regulated organizations",
      description:
        "Overview of public-sector engagement approach and service areas.",
      availability: "on-request",
    },
  ] as const satisfies readonly DocumentCard[],
} as const;

export const contact = {
  title: "Contact",
  address: company.address,
  interimLine:
    "Briefing requests are received through this site. A dedicated contact channel is in setup; submissions are logged for interim processing.",
  responseTarget: "We aim to respond within two business days.",
  form: {
    nameLabel: "Name",
    organizationLabel: "Organization",
    roleLabel: "Role / title",
    emailLabel: "Email",
    categoryLabel: "Category",
    categoryOptions: [
      { value: "government", label: "Government" },
      { value: "healthcare", label: "Healthcare" },
      { value: "research", label: "Research" },
      { value: "partnership", label: "Partnership" },
    ] as const,
    topicLabel: "Topic",
    messageLabel: "Message",
    submitLabel: "Submit briefing request",
    successTitle: "Request received",
    successBody:
      "Your briefing request has been received. We aim to respond within two business days.",
    interimTitle: "Request logged",
    interimBody:
      "Your request has been logged for interim processing. Delivery notification is not yet configured; we will follow up when your channel is active.",
  },
} as const;

export const footer = {
  copyright: `© ${new Date().getFullYear()} Metis LLC. All rights reserved.`,
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

export const gate = {
  wordmark: "Metis LLC",
  pathA: {
    code: "01",
    label: "INITIALIZE_AI_PLANNER",
    href: "/plan",
    description: "Plain-language intent capture, verification matrix, and ranked architecture recommendations.",
  },
  pathB: {
    code: "02",
    label: "CORPORATE_GOVERNANCE",
    href: "/about",
    description: "Institutional overview, capabilities, leadership, research, and engagement channels.",
  },
} as const;

export const planner = {
  title: "Build with Metis",
  eyebrow: "Plain-Language AI Planning Engine",
  description:
    "Describe your workload in natural language. The engine parses intent, scores candidates across ten dimensions, and returns ranked recommendations with export-ready artifacts.",
  canvasLabel: "Intent canvas",
  canvasPlaceholder:
    "Example: I need a low-cost customer support routing system that runs in the cloud with minimal code…",
  micLabel: "Voice input",
  micActiveLabel: "Listening…",
  micUnsupported: "Voice input is not available in this browser.",
  micDenied: "Microphone access was denied. Type your intent instead.",
  compileLabel: "Compile plan",
  verifyTitle: "Verification matrix",
  verifyIntro: "Review parsed parameters before compilation.",
  verifyApprove: "Approve & compile",
  verifyBack: "Edit intent",
  verifyFields: {
    category: "Workload category",
    budget: "Budget",
    deployment: "Deployment",
    privacy: "Privacy priority",
    codeComfort: "Code comfort",
    hardware: "Hardware hint",
    keywords: "Keywords",
  },
  errors: {
    blank: "Intent canvas is empty. Describe your workload before compiling.",
    lowEntropy:
      "Input is too short or lacks detail. Add workload type, constraints, or deployment preference.",
    compileFailed: "Plan compilation failed. Try again or refine your intent.",
    network: "Network error during compilation. Check connection and retry.",
  },
  loading: "Compiling plan…",
  resultsTitle: "Ranked recommendations",
  primaryBadge: "Primary",
  exportTitle: "Export",
  copyLabel: "Copy to clipboard",
  copiedLabel: "Copied",
  printLabel: "Print view",
  exports: {
    plaintext: "Plain text",
    markdown: "Markdown",
    html: "Print HTML",
    claude: "Claude prompt",
    chatgpt: "ChatGPT prompt",
  },
  scenariosTitle: "Reference scenarios",
  scenariosIntro: "Pre-scored case pages for crawlable examples.",
  backToPlanner: "Open live planner",
} as const;

export const plannerScenarios = [
  {
    code: "SC-01",
    slug: "optimized-coding-agents",
    title: "Optimized coding agents",
    blurb:
      "High-latency-sensitive coding agent stack with expert code comfort and hybrid deployment.",
    brief: {
      rawText:
        "Expert developer team needs coding agents with low latency, hybrid deployment, and high reliability for repository automation.",
      category: "coding_agents" as const,
      budget: "high" as const,
      privacyPriority: false,
      deployment: "hybrid" as const,
      codeComfort: "expert" as const,
      hardwareHint: "gpu",
      keywords: ["coding", "agents", "repository", "automation", "developer"],
    },
  },
  {
    code: "SC-02",
    slug: "secure-healthcare-document-analysis",
    title: "Secure healthcare document analysis",
    blurb:
      "HIPAA-aligned document analysis with privacy priority and on-premise posture.",
    brief: {
      rawText:
        "Healthcare organization requires secure document analysis for clinical records with HIPAA privacy and on-premise deployment.",
      category: "document_analysis" as const,
      budget: "medium" as const,
      privacyPriority: true,
      deployment: "local" as const,
      codeComfort: "some" as const,
      hardwareHint: undefined,
      keywords: ["healthcare", "document", "hipaa", "clinical", "privacy"],
    },
  },
  {
    code: "SC-03",
    slug: "consumer-wearable-smart-home-integration",
    title: "Consumer wearable & smart-home integration",
    blurb:
      "On-device automation for wearables and smart-home sensors with offline capability.",
    brief: {
      rawText:
        "Consumer wearable and smart home integration with on-device inference, low latency, and no cloud dependency.",
      category: "device_automation" as const,
      budget: "medium" as const,
      privacyPriority: true,
      deployment: "local" as const,
      codeComfort: "none" as const,
      hardwareHint: "mobile",
      keywords: ["wearable", "smart", "home", "device", "offline"],
    },
  },
  {
    code: "SC-04",
    slug: "low-cost-customer-support-routing",
    title: "Low-cost customer support routing",
    blurb:
      "Budget-conscious ticket triage classifier with cloud deployment and minimal code.",
    brief: {
      rawText:
        "Low cost customer support routing classifier in the cloud with no code setup for helpdesk triage.",
      category: "customer_support" as const,
      budget: "low" as const,
      privacyPriority: false,
      deployment: "cloud" as const,
      codeComfort: "none" as const,
      hardwareHint: undefined,
      keywords: ["support", "routing", "ticket", "helpdesk", "cloud"],
    },
  },
] as const;

export const nav = {
  primary: [
    { label: "Home", href: "/" },
    { label: "Plan", href: "/plan" },
    { label: "About", href: "/about" },
    { label: "Capabilities", href: "/capabilities" },
    { label: "Public Sector", href: "/public-sector" },
    { label: "Research", href: "/research" },
    { label: "Leadership", href: "/leadership" },
    { label: "Documents", href: "/documents" },
    { label: "Contact", href: "/contact" },
  ],
  utility: [
    { label: "Coral Gables, FL", href: "/contact", static: true },
    {
      label: "Download Capability Statement",
      href: "/documents/METIS_Capability_Statement.pdf",
      external: true,
    },
    { label: "Request Briefing", href: "/contact" },
  ],
  homeAnchors: [
    { label: "Overview", id: "overview", href: "/about#overview" },
    { label: "Capabilities", id: "capabilities", href: "/about#capabilities" },
    { label: "Why Metis", id: "why-metis", href: "/about#why-metis" },
    { label: "Leadership", id: "leadership", href: "/about#leadership" },
    { label: "Research", id: "research", href: "/about#research" },
    { label: "Public Sector", id: "public-sector", href: "/about#public-sector" },
    { label: "Security", id: "security", href: "/about#security" },
    { label: "Documents", id: "documents", href: "/about#documents" },
    { label: "Contact", id: "contact", href: "/about#contact" },
  ],
} as const;

export const about = {
  title: "About Metis LLC",
  sections: [
    {
      heading: "Who we are",
      body: overview.paragraphs,
    },
    {
      heading: "What we do",
      body: [
        company.variants.publicSector,
        company.variants.healthcare,
        company.variants.technical,
      ],
    },
    {
      heading: "Where we work",
      body: [
        `Metis LLC is based at ${company.address.formatted}.`,
        "Engagements are conducted remotely and on-site as scope requires.",
      ],
    },
  ],
} as const;

export const privacy = {
  title: "Privacy",
  lastUpdated: "June 2025",
  sections: [
    {
      heading: "Information we collect",
      body: [
        "When you submit a briefing request, we collect the information you provide: name, organization, role, email, category, topic, and message.",
        "We may collect standard web server logs (IP address, browser type, pages visited) for security and operations.",
      ],
    },
    {
      heading: "How we use information",
      body: [
        "Briefing request data is used to respond to your inquiry and evaluate engagement fit.",
        "We do not sell personal information.",
      ],
    },
    {
      heading: "Retention",
      body: [
        "Inquiry records are retained as needed for business and legal purposes, then deleted or anonymized when no longer required.",
      ],
    },
    {
      heading: "Contact",
      body: [
        `Questions about this policy may be submitted via the briefing form at ${company.address.formatted}.`,
      ],
    },
  ],
} as const;

export const terms = {
  title: "Terms of use",
  lastUpdated: "June 2025",
  sections: [
    {
      heading: "Website use",
      body: [
        "This website is provided for informational purposes about Metis LLC and its services.",
        "Content is subject to change without notice.",
      ],
    },
    {
      heading: "No professional advice",
      body: [
        "Materials on this site do not constitute legal, medical, or regulatory advice. Engagements are governed by separate agreements.",
      ],
    },
    {
      heading: "Intellectual property",
      body: [
        "Site content, branding, and documents are owned by Metis LLC unless otherwise noted. Unauthorized reproduction is prohibited.",
      ],
    },
    {
      heading: "Limitation",
      body: [
        "Metis LLC is not liable for damages arising from use of this website to the extent permitted by applicable law.",
      ],
    },
  ],
} as const;

export const langIndicator = {
  active: { code: "en", label: "English" },
  comingSoon: { code: "th", label: "ภาษาไทย (coming soon)" },
} as const;
