import ActionInterceptors from "../../components/ActionInterceptors";
import OverviewLiveMetrics from "../../components/OverviewLiveMetrics";
import {
  HardwareConnectivityMonitor,
  SoakQualificationBadge,
  TestPassLedger,
} from "../../components/ProofWidgets";
import ScenarioStepper from "../../components/ScenarioStepper";
import TrustPane from "../../components/TrustPane";
import styles from "../portal.module.css";

export default function OverviewWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Control plane overview — qualification badges, hardware reachability, and customer journey
        preview for the metis.gold developer portal.
      </p>
      <OverviewLiveMetrics />
      <div className={styles.proofGrid}>
        <TestPassLedger />
        <SoakQualificationBadge />
        <HardwareConnectivityMonitor />
      </div>
      <ScenarioStepper demoStep={2} />
      <TrustPane />
      <ActionInterceptors compact />
    </>
  );
}
