import TenantsRegistryView from "../../components/TenantsRegistryView";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function TenantsWorkspace() {
  const contract = WORKSPACE_CONTRACTS.tenants;

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Tenant registry — operator accounts provisioned on the carrier. Full tenant API pending
        backend route availability.
      </p>
      <TenantsRegistryView />
    </WorkspaceRouteFrame>
  );
}
