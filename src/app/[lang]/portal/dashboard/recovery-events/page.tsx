import RecoveryStandalonePane from "../../components/RecoveryStandalonePane";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function RecoveryEventsWorkspace() {
  const contract = WORKSPACE_CONTRACTS["recovery-events"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Recovery events — analytics trace stream parsed from carrier daemon logs. Recovery clock
        extracted from processing speed payloads when present.
      </p>
      <RecoveryStandalonePane />
    </WorkspaceRouteFrame>
  );
}
