import ActionInterceptors from "../../components/ActionInterceptors";
import UsageLedgerView from "../../components/UsageLedgerView";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function UsageLedgerWorkspace() {
  const contract = WORKSPACE_CONTRACTS["usage-ledger"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Usage ledger — byte volume, poll history, and carrier telemetry counters synced from the serial bus."
      />
      <UsageLedgerView title="USAGE_LEDGER //" />
      <ActionInterceptors compact />
    </WorkspaceRouteFrame>
  );
}
