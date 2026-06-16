import KeyVaultView from "../../components/KeyVaultView";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

export const dynamic = "force-dynamic";

export default function KeyVaultWorkspace() {
  const contract = WORKSPACE_CONTRACTS["key-vault"];

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Credential vault — token lifecycle controls for generate, seal, and revoke workflows with expiring plaintext issuance."
      />
      <KeyVaultView />
    </WorkspaceRouteFrame>
  );
}
