import DashboardNavigation from "./DashboardNavigation";
import DashboardSessionBar from "./DashboardSessionBar";
import shellStyles from "./shell.module.css";

export type Operator = {
  id?: string;
  email: string;
  name?: string;
};

export const DASHBOARD_NAV_ITEMS = [
  { segment: "overview", label: "Overview" },
  { segment: "key-vault", label: "Key Vault" },
  { segment: "ingestion-jobs", label: "Ingestion Jobs" },
  { segment: "usage-ledger", label: "Usage Ledger" },
  { segment: "hardware-health", label: "Hardware Health" },
  { segment: "recovery-events", label: "Recovery Events" },
  { segment: "tenants", label: "Tenants" },
  { segment: "billing", label: "Billing" },
  { segment: "security", label: "Security" },
  { segment: "audit-trail", label: "Audit Trail" },
] as const;

type Props = {
  lang: string;
  operator: Operator;
  children: React.ReactNode;
};

/** Server-owned dashboard chrome keeps route children outside long-lived client state. */
export default function DashboardShell({ lang, operator, children }: Props) {
  return (
    <div
      key={`dashboard-shell:${lang}:${operator.email}`}
      className={shellStyles.dashboardFrame}
      data-dashboard-shell="server"
      data-session-source="/api/session/identity"
      data-operator-email={operator.email}
    >
      <DashboardNavigation lang={lang} items={DASHBOARD_NAV_ITEMS} />
      <div className={shellStyles.workspace}>
        <header className={shellStyles.workspaceHeader} data-dashboard-chrome="server">
          METIS // CONTROL PLANE
        </header>
        <DashboardSessionBar lang={lang} operator={operator} />
        <main className={shellStyles.workspaceMain} data-workspace-boundary="route-children">
          {children}
        </main>
      </div>
    </div>
  );
}
