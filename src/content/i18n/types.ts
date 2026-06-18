export type Locale = "en" | "es" | "zh" | "th";

export type NavSegment = {
  label: string;
  segment: string;
};

export type NavUtilityItem =
  | { label: string; segment: string; static: true }
  | { label: string; href: string; external: true }
  | { label: string; segment: string };

export type SiteContent = {
  meta: { title: string; description: string };
  company: {
    name: string;
    tagline: string;
    oneLiner: string;
    address: {
      street: string;
      city: string;
      state: string;
      postal: string;
      country: string;
      formatted: string;
    };
    variants: { publicSector: string; healthcare: string; technical: string };
  };
  hero: { eyebrow: string; headline: string; description: string };
  overview: { title: string; paragraphs: string[] };
  capabilities: {
    title: string;
    intro: string;
    categories: {
      id: string;
      title: string;
      summary: string;
      items: string[];
    }[];
    engagementModels: {
      title: string;
      items: { name: string; description: string }[];
    };
  };
  whyMetis: { title: string; points: { title: string; body: string }[] };
  leadership: {
    name: string;
    title: string;
    bio: string;
    focusAreas: string[];
    researchAnchor: { label: string; citation: string; doi: string; url: string };
    location: string;
    links: NavSegment[];
  };
  research: {
    title: string;
    publication: {
      title: string;
      journal: string;
      date: string;
      doi: string;
      url: string;
    };
    summary: string;
    whyItMatters: string;
    relatedDirections: string[];
  };
  publicSector: {
    title: string;
    intro: string;
    services: string[];
    howEngagementsBegin: { title: string; steps: string[] };
  };
  security: { title: string; statements: string[] };
  documents: {
    title: string;
    intro: string;
    cards: {
      id: string;
      name: string;
      version: string;
      audience: string;
      description: string;
      availability: "download" | "on-request";
      href?: string;
      onRequestLabel: string;
      downloadLabel: string;
    }[];
  };
  contact: {
    title: string;
    interimLine: string;
    responseTarget: string;
    form: {
      nameLabel: string;
      organizationLabel: string;
      roleLabel: string;
      emailLabel: string;
      categoryLabel: string;
      categoryOptions: { value: string; label: string }[];
      topicLabel: string;
      messageLabel: string;
      submitLabel: string;
      successTitle: string;
      successBody: string;
      interimTitle: string;
      interimBody: string;
      selectCategory: string;
      submitting: string;
    };
    errors: { blank: string; network: string; compileFailed: string };
  };
  footer: { copyright: string; legal: NavSegment[]; resources: NavSegment[] };
  nav: {
    primary: NavSegment[];
    utility: NavUtilityItem[];
    homeAnchors: { label: string; id: string }[];
  };
  about: { title: string; sections: { heading: string; body: string[] }[] };
  privacy: { title: string; lastUpdated: string; sections: { heading: string; body: string[] }[] };
  terms: { title: string; lastUpdated: string; sections: { heading: string; body: string[] }[] };
  pricing: {
    title: string;
    intro: string;
    pilot: {
      name: string;
      price: string;
      period: string;
      description: string;
      features: string[];
      cta: string;
    };
    platform: {
      name: string;
      price: string;
      period: string;
      description: string;
      features: string[];
      cta: string;
    };
    enterprise: {
      name: string;
      price: string;
      period: string;
      description: string;
      features: string[];
      cta: string;
    };
    footnote: string;
  };
  startPilot: {
    title: string;
    intro: string;
    form: {
      companyLabel: string;
      primaryContactLabel: string;
      primaryEmailLabel: string;
      billingContactLabel: string;
      billingEmailLabel: string;
      technicalContactLabel: string;
      technicalEmailLabel: string;
      useCaseLabel: string;
      volumeLabel: string;
      complianceLabel: string;
      timelineLabel: string;
      notesLabel: string;
      submitLabel: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      interimTitle: string;
      interimBody: string;
    };
    confirmation: {
      title: string;
      steps: string[];
      prepare: string[];
      sla: string;
      contact: string;
    };
    errors: {
      blank: string;
      network: string;
      compileFailed: string;
    };
  };
  quickstart: {
    title: string;
    intro: string;
    sections: { heading: string; body: string[] }[];
    authHeader: string;
    curlExample: string;
    responseExample: string;
  };
  support: {
    title: string;
    intro: string;
    contacts: { role: string; value: string }[];
    responseTimes: { label: string; value: string }[];
    hours: string;
    escalation: { title: string; steps: string[] };
    incidents: { title: string; body: string[] };
  };
  ui: {
    requestBriefing: string;
    capabilityStatement: string;
    viewCapabilities: string;
    fullLeadership: string;
    researchDetails: string;
    publicSectorEngagement: string;
    allDocuments: string;
    contactPage: string;
    downloadPdf: string;
    primaryBadge: string;
    leadership: string;
    focusAreas: string;
    office: string;
    briefingRequest: string;
    requestBriefingCta: string;
    services: string;
    relatedDirections: string;
    clientPortal: string;
    returnToSite: string;
    startPilot: string;
    requestAccess: string;
    pricing: string;
    quickstart: string;
    support: string;
    viewPricing: string;
    startPilotCta: string;
  };
  langSwitcher: Record<Locale, string>;
};
