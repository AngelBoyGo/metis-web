import UsageLedgerView from "../../components/UsageLedgerView";
import styles from "../portal.module.css";

export default function BillingWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Billing workspace — metered invoicing, cost breakdown, and exportable usage artifacts for
        the current UTC cycle.
      </p>
      <UsageLedgerView title="BILLING //" showExport />
    </>
  );
}
