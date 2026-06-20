import type { ReactNode } from "react";
import type { WorkspaceContract, WorkspaceKey } from "./workspace-contracts";
import styles from "../dashboard/portal.module.css";

type Props = WorkspaceContract & {
  routeSegment: WorkspaceKey;
  children: ReactNode;
};

/** Blocks rendering when a page is paired with the wrong workspace contract. */
export default function WorkspaceRouteFrame({
  routeSegment,
  workspaceKey,
  title,
  sourceContract,
  children,
}: Props) {
  const routeMatches = routeSegment === workspaceKey;

  if (!routeMatches) {
    return (
      <article
        className={`${styles.proofCard} ${styles.offlineCard}`}
        data-workspace-key={workspaceKey}
        data-route-segment={routeSegment}
      >
        <span className={styles.metricLabel}>WORKSPACE_ROUTE_MISMATCH //</span>
        <p className={styles.offlineHeadline}>
          [ ROUTE_GUARD ] {title} content blocked — route contract mismatch
        </p>
        <div className={styles.auditMeta}>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>EXPECTED //</span>
            <span>{routeSegment}</span>
          </div>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>ACTIVE //</span>
            <span>{workspaceKey}</span>
          </div>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>SOURCE_CONTRACT //</span>
            <span>{sourceContract}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div
      key={`workspace-route:${routeSegment}:${workspaceKey}`}
      data-route-segment={routeSegment}
      data-workspace-key={workspaceKey}
      data-workspace-title={title}
      data-source-contract={sourceContract}
      data-route-identity="server-contract"
    >
      {children}
    </div>
  );
}
