import TrustPane from "../../components/TrustPane";
import ScenarioStepper from "../../components/ScenarioStepper";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function SecurityWorkspace() {
  const contract = WORKSPACE_CONTRACTS.security;

  return (
    <WorkspaceRouteFrame routeSegment="security" {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Security posture — token auth, admin route concealment, and metering integrity controls for the metis.gold control plane."
      />
      <TrustPane />
      <ScenarioStepper demoStep={1} />
    </WorkspaceRouteFrame>
  );
}
