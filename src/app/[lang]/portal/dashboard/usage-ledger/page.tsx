import ActionInterceptors from "../../components/ActionInterceptors";
import UsageLedgerView from "../../components/UsageLedgerView";
import styles from "../portal.module.css";

export default function UsageLedgerWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Usage ledger — byte volume, poll history, and carrier telemetry counters synced from the
        serial bus every five seconds.
      </p>
      <UsageLedgerView title="USAGE_LEDGER //" />
      <ActionInterceptors compact />
    </>
  );
}
