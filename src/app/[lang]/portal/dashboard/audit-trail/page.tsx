import AuditTrailView from "../../components/AuditTrailView";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function AuditTrailWorkspace() {
  const contract = WORKSPACE_CONTRACTS["audit-trail"];

  return (
    <WorkspaceRouteFrame routeSegment="audit-trail" {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Audit trail — audit events, operator action history, and integrity metadata streamed from the carrier audit endpoint."
      />
      <AuditTrailView />
    </WorkspaceRouteFrame>
  );
}
