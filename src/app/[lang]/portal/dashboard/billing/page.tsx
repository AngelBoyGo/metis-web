import UsageLedgerView from "../../components/UsageLedgerView";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function BillingWorkspace() {
  const contract = WORKSPACE_CONTRACTS.billing;

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Billing workspace — metered invoicing, cost breakdown, and exportable usage artifacts for the current UTC cycle."
      />
      <UsageLedgerView title="BILLING //" showExport />
    </WorkspaceRouteFrame>
  );
}
