import RecoveryStandalonePane from "../../components/RecoveryStandalonePane";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function RecoveryEventsWorkspace() {
  const contract = WORKSPACE_CONTRACTS["recovery-events"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="DEGRADED"
        intro="Recovery events — recovery telemetry, event timeline, and carrier link state parsed from carrier daemon traces."
      />
      <RecoveryStandalonePane />
    </WorkspaceRouteFrame>
  );
}
