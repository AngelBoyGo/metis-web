/** English customer-readiness copy shared across locales (es/zh/th use as placeholder). */

export const customerReadinessPricing = {
  title: "Pricing",
  intro:
    "Transparent engagement tiers for pilot evaluation, production platform access, and enterprise programs. All prices in USD; final terms confirmed in contract.",
  pilot: {
    name: "Pilot",
    price: "$2,500",
    period: "one-time",
    description: "Structured pilot for scoped evaluation with sandbox access and onboarding support.",
    features: [
      "30-day sandbox environment",
      "Up to 3 operator seats",
      "Key Vault credential issuance",
      "Usage ledger and audit trail access",
      "Dedicated onboarding contact",
    ],
    cta: "Start pilot checkout",
  },
  platform: {
    name: "Platform",
    price: "$499",
    period: "per month",
    description: "Production platform subscription with metered usage and standard support.",
    features: [
      "Production API access",
      "Unlimited operator seats",
      "Metered usage ledger",
      "Standard support SLA",
      "Monthly invoicing",
    ],
    cta: "Subscribe to platform",
  },
  enterprise: {
    name: "Enterprise",
    price: "Custom",
    period: "annual contract",
    description: "Dedicated deployment, compliance packaging, and custom SLA for regulated programs.",
    features: [
      "Dedicated infrastructure options",
      "Custom compliance documentation",
      "Named account owner",
      "Priority escalation path",
      "Volume pricing",
    ],
    cta: "Request enterprise quote",
  },
  footnote:
    "Enterprise engagements begin with a scoped intake. Pilot and Platform checkout uses Stripe; ACH/wire available on invoice for qualified accounts.",
};

export const customerReadinessStartPilot = {
  title: "Start pilot",
  intro:
    "Submit your organization details for pilot onboarding. Our team reviews intake within two business days and follows up with next steps.",
  form: {
    companyLabel: "Company / organization",
    primaryContactLabel: "Primary contact name",
    primaryEmailLabel: "Primary contact email",
    billingContactLabel: "Billing contact name",
    billingEmailLabel: "Billing contact email",
    technicalContactLabel: "Technical contact name",
    technicalEmailLabel: "Technical contact email",
    useCaseLabel: "Primary use case",
    volumeLabel: "Expected monthly volume",
    complianceLabel: "Compliance requirements",
    timelineLabel: "Target timeline",
    notesLabel: "Additional notes",
    submitLabel: "Submit pilot intake",
    submitting: "Submitting…",
    successTitle: "Intake received",
    successBody:
      "Your pilot intake has been received. A member of our onboarding team responds within two business days.",
    interimTitle: "Intake logged",
    interimBody:
      "Your intake has been logged for interim processing. Delivery notification is not yet configured; we follow up when your channel is active.",
  },
  confirmation: {
    title: "What happens next",
    steps: [
      "Intake review within two business days.",
      "Discovery call to confirm scope, compliance constraints, and timeline.",
      "Pilot agreement and sandbox provisioning.",
      "Credential issuance via Key Vault and quickstart walkthrough.",
    ],
    prepare: [
      "Primary, billing, and technical contacts available for kickoff.",
      "Use case summary and expected monthly volume estimate.",
      "Compliance or procurement requirements documented.",
    ],
    sla: "Response target: two business days for initial review.",
    contact: "Questions before submission? Use the support page or contact form.",
  },
  errors: {
    blank: "All required fields must be completed.",
    network: "Network error. Please try again.",
    compileFailed: "Unable to submit intake.",
  },
};

export const customerReadinessQuickstart = {
  title: "API quickstart",
  intro:
    "Integrate with the Metis control plane API. Replace CONFIG_NEEDED placeholders with values from your provisioning package.",
  sections: [
    {
      heading: "Base URL",
      body: [
        "Production API base: CONFIG_NEEDED (provided after tenant provisioning).",
        "Sandbox base: CONFIG_NEEDED (provided with pilot intake approval).",
      ],
    },
    {
      heading: "Authentication",
      body: [
        "Issue a bearer credential in the portal Key Vault. Plaintext is shown once at issuance — copy immediately.",
        "Include the credential in the Authorization header on every request.",
      ],
    },
    {
      heading: "Submit jobs",
      body: [
        "Ingestion job endpoints: CONFIG_NEEDED (see provisioning documentation).",
        "Poll job status via the ingestion workspace or API status routes.",
      ],
    },
    {
      heading: "Usage and billing",
      body: [
        "View metered byte volume in the portal Usage Ledger and Billing workspace.",
        "Export usage artifacts for invoice reconciliation.",
      ],
    },
    {
      heading: "Credential lifecycle",
      body: [
        "Rotate by generating a new credential and revoking the prior one.",
        "Revoked credentials are purged from the vault; audit trail records the event.",
      ],
    },
    {
      heading: "Support",
      body: [
        "Account questions: CONFIG_NEEDED (support mailbox).",
        "Billing: CONFIG_NEEDED (billing mailbox).",
      ],
    },
  ],
  authHeader: "Authorization: Bearer YOUR_API_KEY",
  curlExample: `curl -X GET "CONFIG_NEEDED/api/v1/status" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Accept: application/json"`,
  responseExample: `{
  "status": "ok",
  "tenant": "CONFIG_NEEDED"
}`,
};

export const customerReadinessSupport = {
  title: "Support",
  intro:
    "Account support, escalation paths, and incident reporting for Metis platform customers.",
  contacts: [
    { role: "General support", value: "CONFIG_NEEDED" },
    { role: "Billing inquiries", value: "CONFIG_NEEDED" },
    { role: "Account owner", value: "CONFIG_NEEDED" },
  ],
  responseTimes: [
    { label: "Standard requests", value: "Two business days" },
    { label: "Priority (production impact)", value: "CONFIG_NEEDED" },
    { label: "Critical (security incident)", value: "CONFIG_NEEDED" },
  ],
  hours: "Support hours: CONFIG_NEEDED (timezone).",
  escalation: {
    title: "Escalation path",
    steps: [
      "Submit via support email with severity and tenant identifier.",
      "Account owner acknowledges within response-time target.",
      "Engineering escalation for unresolved production impact.",
      "Executive escalation for contractual or compliance matters.",
    ],
  },
  incidents: {
    title: "Incident reporting",
    body: [
      "Report suspected security incidents to CONFIG_NEEDED with severity, scope, and contact details.",
      "Status page: CONFIG_NEEDED (when available).",
      "Post-incident summaries provided per contract terms.",
    ],
  },
};

export const customerReadinessUi = {
  startPilot: "Start pilot",
  requestAccess: "Request access",
  pricing: "Pricing",
  quickstart: "Quickstart",
  support: "Support",
  viewPricing: "View pricing →",
  startPilotCta: "Start pilot →",
};
