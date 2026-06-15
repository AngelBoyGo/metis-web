import TrustPane from "../../components/TrustPane";
import ScenarioStepper from "../../components/ScenarioStepper";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function SecurityWorkspace() {
  const contract = WORKSPACE_CONTRACTS.security;

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Security posture — token auth, admin route concealment, and metering integrity guarantees
        for the metis.gold control plane.
      </p>
      <TrustPane />
      <ScenarioStepper demoStep={1} />
    </WorkspaceRouteFrame>
  );
}
