"use client";

import styles from "./auth.module.css";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.errorCard}>
      <div className={styles.errorLabel}>GATEWAY_CONNECTION_TIMEOUT //</div>
      <p className={styles.errorMessage}>{error.message}</p>
      <button type="button" className={styles.actionButton} onClick={() => reset()}>
        RESET_GATEWAY //
      </button>
    </div>
  );
}
