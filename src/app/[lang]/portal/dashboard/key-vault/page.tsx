import KeyVaultView from "../../components/KeyVaultView";
import styles from "../portal.module.css";

export default function KeyVaultWorkspace() {
  return (
    <>
      <p className={styles.pageIntro}>
        Credential vault — generate, copy, seal, and revoke operator tokens. Plaintext secrets
        expire after the issuance window.
      </p>
      <KeyVaultView />
    </>
  );
}
