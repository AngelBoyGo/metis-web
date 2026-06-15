import ActionInterceptors from "../../components/ActionInterceptors";
import ScenarioStepper from "../../components/ScenarioStepper";
import TrustPane from "../../components/TrustPane";
import styles from "../portal.module.css";

export default function IngestionJobsWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Ingestion job control — queue carrier workloads, monitor lane status, and trace byte
        metering from submit through artifact download.
      </p>
      <ScenarioStepper demoStep={3} />
      <TrustPane filter={["INGESTION_AT_SCALE", "BIT_METERING"]} />
      <ActionInterceptors />
    </>
  );
}
