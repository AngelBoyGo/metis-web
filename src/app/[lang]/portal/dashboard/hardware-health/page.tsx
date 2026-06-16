import ActionInterceptors from "../../components/ActionInterceptors";
import HardwareHealthPane from "../../components/HardwareHealthPane";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function HardwareHealthWorkspace() {
  const contract = WORKSPACE_CONTRACTS["hardware-health"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="DEGRADED"
        intro="Hardware health — port reachability, bench state, and COM terminal link status polled from the carrier health endpoint."
      />
      <HardwareHealthPane />
      <ActionInterceptors compact forceStandardLabels />
    </WorkspaceRouteFrame>
  );
}
