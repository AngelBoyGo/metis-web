import ActionInterceptors from "../../components/ActionInterceptors";
import UsageLedgerView from "../../components/UsageLedgerView";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function UsageLedgerWorkspace() {
  const contract = WORKSPACE_CONTRACTS["usage-ledger"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Usage ledger — byte volume, poll history, and carrier telemetry counters synced from the
        serial bus every five seconds.
      </p>
      <UsageLedgerView title="USAGE_LEDGER //" />
      <ActionInterceptors compact />
    </WorkspaceRouteFrame>
  );
}
