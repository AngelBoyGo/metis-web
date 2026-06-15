import ActionInterceptors from "../../components/ActionInterceptors";
import ControlPlaneDeepLinks from "../../components/ControlPlaneDeepLinks";
import OverviewLiveMetrics from "../../components/OverviewLiveMetrics";
import {
  HardwareConnectivityMonitor,
  SoakQualificationBadge,
  TestPassLedger,
} from "../../components/ProofWidgets";
import ScenarioStepper from "../../components/ScenarioStepper";
import TrustPane from "../../components/TrustPane";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function OverviewWorkspace() {
  const contract = WORKSPACE_CONTRACTS.overview;

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Control plane overview — qualification badges, hardware reachability, and customer journey
        preview for the metis.gold developer portal.
      </p>
      <section className={styles.sectionCompact}>
        <div className={styles.sectionTitle}>WHAT_TO_DO_NEXT //</div>
        <p className={styles.pageIntro}>
          Generate an API key in Key Vault, confirm hardware reachability, then open Usage Ledger to
          review metered byte volume. Recovery Events and Audit Trail stay available when the carrier
          link is offline — each workspace shows its own empty or demo state.
        </p>
      </section>
      <OverviewLiveMetrics />
      <ControlPlaneDeepLinks />
      <div className={styles.proofGrid}>
        <TestPassLedger />
        <SoakQualificationBadge />
        <HardwareConnectivityMonitor />
      </div>
      <ScenarioStepper demoStep={2} />
      <TrustPane />
      <ActionInterceptors compact />
    </WorkspaceRouteFrame>
  );
}
