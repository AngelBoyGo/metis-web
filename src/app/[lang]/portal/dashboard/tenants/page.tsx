import TenantsRegistryView from "../../components/TenantsRegistryView";
import styles from "../portal.module.css";

export default function TenantsWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Tenant registry — operator accounts provisioned on the carrier. Full tenant API pending
        backend route availability.
      </p>
      <TenantsRegistryView />
    </>
  );
}
