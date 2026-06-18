import ActionInterceptors from "../../components/ActionInterceptors";
import ActivationChecklist from "../../components/ActivationChecklist";
import ControlPlaneDeepLinks from "../../components/ControlPlaneDeepLinks";
import OverviewLiveMetrics from "../../components/OverviewLiveMetrics";
import {
  HardwareConnectivityMonitor,
  SoakQualificationBadge,
  TestPassLedger,
} from "../../components/ProofWidgets";
import ScenarioStepper from "../../components/ScenarioStepper";
import TrustPane from "../../components/TrustPane";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function OverviewWorkspace() {
  const contract = WORKSPACE_CONTRACTS.overview;

  return (
    <WorkspaceRouteFrame routeSegment="overview" {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Control plane overview — qualification badges, hardware reachability, and next actions for the metis.gold developer portal."
      />
      <section className={styles.sectionCompact}>
        <div className={styles.sectionTitle}>WHAT_TO_DO_NEXT //</div>
        <p className={styles.pageIntro}>
          Generate an API key in Key Vault, confirm hardware reachability, then open Usage Ledger to
          review metered byte volume. Recovery Events and Audit Trail stay available when the carrier
          link is offline — each workspace shows its own empty or demo state.
        </p>
      </section>
      <ActivationChecklist />
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
