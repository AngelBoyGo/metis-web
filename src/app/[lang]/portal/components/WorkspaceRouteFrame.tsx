"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { WorkspaceContract } from "./workspace-contracts";
import styles from "../dashboard/portal.module.css";

type Props = WorkspaceContract & {
  children: ReactNode;
};

function resolveWorkspaceSegment(pathname: string): string | null {
  const match = pathname.match(/\/portal\/dashboard\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export default function WorkspaceRouteFrame({
  workspaceKey,
  title,
  sourceContract,
  children,
}: Props) {
  const pathname = usePathname();
  const activeSegment = resolveWorkspaceSegment(pathname);
  const routeMatches = activeSegment === workspaceKey;

  if (!routeMatches) {
    return (
      <article
        className={`${styles.proofCard} ${styles.offlineCard}`}
        data-workspace-key={workspaceKey}
        data-route-segment={activeSegment ?? "unknown"}
      >
        <span className={styles.metricLabel}>WORKSPACE_ROUTE_MISMATCH //</span>
        <p className={styles.offlineHeadline}>
          [ ROUTE_GUARD ] {title} content blocked — URL segment mismatch
        </p>
        <div className={styles.auditMeta}>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>EXPECTED //</span>
            <span>{workspaceKey}</span>
          </div>
          <div className={styles.auditMetaRow}>
            <span className={styles.auditMetaLabel}>ACTIVE //</span>
            <span>{activeSegment ?? "none"}</span>
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
      data-workspace-key={workspaceKey}
      data-workspace-title={title}
      data-source-contract={sourceContract}
    >
      {children}
    </div>
  );
}
