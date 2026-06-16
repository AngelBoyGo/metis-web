import TenantsRegistryView from "../../components/TenantsRegistryView";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function TenantsWorkspace() {
  const contract = WORKSPACE_CONTRACTS.tenants;

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="DEGRADED"
        intro="Tenant registry — registry records, operator accounts, and tenant state for carrier-provisioned organizations."
      />
      <TenantsRegistryView />
    </WorkspaceRouteFrame>
  );
}
