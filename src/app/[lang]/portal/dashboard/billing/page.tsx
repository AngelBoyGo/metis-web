import UsageLedgerView from "../../components/UsageLedgerView";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function BillingWorkspace() {
  const contract = WORKSPACE_CONTRACTS.billing;

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Billing workspace — metered invoicing, cost breakdown, and exportable usage artifacts for
        the current UTC cycle.
      </p>
      <UsageLedgerView title="BILLING //" showExport />
    </WorkspaceRouteFrame>
  );
}
