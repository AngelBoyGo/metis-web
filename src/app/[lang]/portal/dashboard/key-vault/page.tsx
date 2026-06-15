import KeyVaultView from "../../components/KeyVaultView";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";
import styles from "../portal.module.css";

export const dynamic = "force-dynamic";

export default function KeyVaultWorkspace() {
  const contract = WORKSPACE_CONTRACTS["key-vault"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <p className={styles.pageIntro}>
        Credential vault — generate, copy, seal, and revoke operator tokens. Plaintext secrets
        expire after the issuance window.
      </p>
      <KeyVaultView />
    </WorkspaceRouteFrame>
  );
}
