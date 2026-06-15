import styles from "../portal.module.css";

export default function TenantsWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Tenant registry — operator accounts provisioned on the carrier. Full tenant API pending
        backend route availability.
      </p>
      <div className={styles.placeholderPanel}>
        [ OFFLINE ] TENANT_REGISTRY_CARRIER_LINK_PENDING //
      </div>
    </>
  );
}
