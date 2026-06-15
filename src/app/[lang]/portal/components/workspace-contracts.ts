export type WorkspaceContract = {
  workspaceKey: string;
  title: string;
  sourceContract: string;
};

export const WORKSPACE_CONTRACTS = {
  overview: {
    workspaceKey: "overview",
    title: "Overview",
    sourceContract: "/api/overview/counters · /api/serial/status",
  },
  "key-vault": {
    workspaceKey: "key-vault",
    title: "Key Vault",
    sourceContract: "/api/keys/list · /api/keys",
  },
  "ingestion-jobs": {
    workspaceKey: "ingestion-jobs",
    title: "Ingestion Jobs",
    sourceContract: "/api/jobs/scenario/stages · /api/serial/status",
  },
  "usage-ledger": {
    workspaceKey: "usage-ledger",
    title: "Usage Ledger",
    sourceContract: "/api/serial/status · /api/usage",
  },
  "hardware-health": {
    workspaceKey: "hardware-health",
    title: "Hardware Health",
    sourceContract: "/api/hardware/health · /api/hardware/trace",
  },
  "recovery-events": {
    workspaceKey: "recovery-events",
    title: "Recovery Events",
    sourceContract: "/api/hardware/trace",
  },
  tenants: {
    workspaceKey: "tenants",
    title: "Tenants",
    sourceContract: "/api/tenants",
  },
  billing: {
    workspaceKey: "billing",
    title: "Billing",
    sourceContract: "/api/serial/status · /api/usage",
  },
  security: {
    workspaceKey: "security",
    title: "Security",
    sourceContract: "/api/audit/trail",
  },
  "audit-trail": {
    workspaceKey: "audit-trail",
    title: "Audit Trail",
    sourceContract: "/api/audit/trail",
  },
} as const satisfies Record<string, WorkspaceContract>;

export type WorkspaceKey = keyof typeof WORKSPACE_CONTRACTS;
