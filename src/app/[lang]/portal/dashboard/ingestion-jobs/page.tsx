import ActionInterceptors from "../../components/ActionInterceptors";
import ScenarioStepper from "../../components/ScenarioStepper";
import TrustPane from "../../components/TrustPane";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function IngestionJobsWorkspace() {
  const contract = WORKSPACE_CONTRACTS["ingestion-jobs"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Ingestion job control — queue carrier workloads, monitor lane status, and trace byte
        metering from submit through artifact download.
      </p>
      <ScenarioStepper demoStep={3} />
      <TrustPane filter={["INGESTION_AT_SCALE", "BIT_METERING"]} />
      <ActionInterceptors />
    </WorkspaceRouteFrame>
  );
}
