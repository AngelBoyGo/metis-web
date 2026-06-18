import styles from "../dashboard/portal.module.css";

const CHECKLIST_ITEMS = [
  { id: "tenant", label: "Tenant provisioned", hint: "Workspace identity block shows tenant scope" },
  { id: "roles", label: "Operator roles assigned", hint: "Session bar reflects authenticated operator" },
  { id: "credential", label: "Credential issued and sealed", hint: "Generate in Key Vault; copy plaintext once" },
  { id: "endpoint", label: "API endpoint confirmed", hint: "See quickstart for CONFIG_NEEDED base URL" },
  { id: "limits", label: "Usage limits documented", hint: "Usage Ledger shows allocation and meter" },
  { id: "sandbox", label: "Sandbox vs live policy acknowledged", hint: "Pilot uses sandbox; production after contract" },
  { id: "first-request", label: "First API request submitted", hint: "Run sample curl from quickstart" },
  { id: "audit", label: "Audit trail verified", hint: "Audit Trail workspace records operator actions" },
] as const;

/**
 * Customer activation checklist for portal overview.
 */
export default function ActivationChecklist() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>ACTIVATION_CHECKLIST //</div>
      <p className={styles.pageIntro}>
        Complete these steps to activate your Metis tenant. Items reflect provisioning state — contact
        support if any step remains blocked after onboarding.
      </p>
      <ul className={styles.activationList}>
        {CHECKLIST_ITEMS.map((item, index) => (
          <li key={item.id} className={styles.activationItem}>
            <span className={styles.activationIndex}>{index + 1}</span>
            <div>
              <span className={styles.activationLabel}>{item.label}</span>
              <p className={styles.metricTileHint}>{item.hint}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
