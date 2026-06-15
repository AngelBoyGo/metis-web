import TrustPane from "../../components/TrustPane";
import ScenarioStepper from "../../components/ScenarioStepper";
import styles from "../portal.module.css";

export default function SecurityWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Security posture — token auth, admin route concealment, and metering integrity guarantees
        for the metis.gold control plane.
      </p>
      <TrustPane />
      <ScenarioStepper demoStep={1} />
    </>
  );
}
