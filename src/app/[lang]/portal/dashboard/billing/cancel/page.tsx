import Link from "next/link";
import WorkspaceIdentityBlock from "../../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../../components/workspace-contracts";
import styles from "../../portal.module.css";

type Props = { params: Promise<{ lang: string }> };

export const dynamic = "force-dynamic";

export default async function BillingCancelPage({ params }: Props) {
  const { lang } = await params;
  const contract = WORKSPACE_CONTRACTS.billing;

  return (
    <WorkspaceRouteFrame routeSegment="billing" {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Checkout canceled — no charge applied."
      />
      <section className={styles.section}>
        <div className={styles.sectionTitle}>CHECKOUT_CANCELED //</div>
        <p className={styles.pageIntro}>
          Checkout was canceled before payment completed. You can retry from the billing workspace or
          pricing page, or contact billing for invoice-based payment.
        </p>
        <p className={styles.vaultHint}>
          <Link href={`/${lang}/portal/dashboard/billing`}>Return to billing workspace</Link>
          {" · "}
          <Link href={`/${lang}/pricing`}>View pricing</Link>
        </p>
      </section>
    </WorkspaceRouteFrame>
  );
}
