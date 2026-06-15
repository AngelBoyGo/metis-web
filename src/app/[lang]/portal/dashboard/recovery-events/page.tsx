import { RecoveryTelemetryPane } from "../../components/ProofWidgets";
import styles from "../portal.module.css";

export default function RecoveryEventsWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Recovery events — analytics trace stream parsed from carrier daemon logs. Recovery clock
        extracted from processing speed payloads when present.
      </p>
      <RecoveryTelemetryPane />
    </>
  );
}
