import UsageLedgerView from "../../components/UsageLedgerView";
import BillingWorkspacePanel from "../../components/BillingWorkspacePanel";
import WorkspaceIdentityBlock from "../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../components/workspace-contracts";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export default async function BillingWorkspace({ params }: Props) {
  const { lang } = await params;
  const contract = WORKSPACE_CONTRACTS.billing;

  return (
    <WorkspaceRouteFrame {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Billing workspace — plan status, payment state, metered usage, and exportable artifacts for the current UTC cycle."
      />
      <BillingWorkspacePanel lang={lang} />
      <UsageLedgerView title="METERED_USAGE //" showExport />
    </WorkspaceRouteFrame>
  );
}
