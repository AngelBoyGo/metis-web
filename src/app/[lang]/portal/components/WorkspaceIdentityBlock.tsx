import type { WorkspaceContract } from "./workspace-contracts";
import styles from "../dashboard/portal.module.css";

export type WorkspaceStateLabel = "LIVE" | "DEMO" | "EMPTY" | "OFFLINE" | "DEGRADED";

type Props = WorkspaceContract & {
  intro: string;
  stateLabel: WorkspaceStateLabel;
};

/** Renders the first visible route identity contract for each dashboard workspace. */
export default function WorkspaceIdentityBlock({
  workspaceKey,
  title,
  sourceContract,
  intro,
  stateLabel,
}: Props) {
  return (
    <section
      className={styles.sectionCompact}
      data-workspace-key={workspaceKey}
      data-workspace-title={title}
      data-source-contract={sourceContract}
      data-state-label={stateLabel}
    >
      <div className={styles.sectionTitle}>
        {title.toUpperCase()} // ROUTE_IDENTITY
      </div>
      <p className={styles.pageIntro}>{intro}</p>
      <div className={styles.auditMeta}>
        <div className={styles.auditMetaRow}>
          <span className={styles.auditMetaLabel}>WORKSPACE_KEY //</span>
          <span>{workspaceKey}</span>
        </div>
        <div className={styles.auditMetaRow}>
          <span className={styles.auditMetaLabel}>SOURCE_API //</span>
          <span>{sourceContract}</span>
        </div>
        <div className={styles.auditMetaRow}>
          <span className={styles.auditMetaLabel}>STATE_LABEL //</span>
          <span>{stateLabel}</span>
        </div>
      </div>
    </section>
  );
}
