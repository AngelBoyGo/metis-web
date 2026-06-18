import Link from "next/link";
import WorkspaceIdentityBlock from "../../../components/WorkspaceIdentityBlock";
import WorkspaceRouteFrame from "../../../components/WorkspaceRouteFrame";
import { WORKSPACE_CONTRACTS } from "../../../components/workspace-contracts";
import styles from "../../portal.module.css";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export const dynamic = "force-dynamic";

export default async function BillingSuccessPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { session_id: sessionId } = await searchParams;
  const contract = WORKSPACE_CONTRACTS.billing;

  return (
    <WorkspaceRouteFrame routeSegment="billing" {...contract}>
      <WorkspaceIdentityBlock
        {...contract}
        stateLabel="LIVE"
        intro="Checkout complete — payment confirmation appears after webhook processing."
      />
      <section className={styles.section}>
        <div className={styles.sectionTitle}>CHECKOUT_COMPLETE //</div>
        <p className={styles.pageIntro}>
          Thank you. Your payment session has completed. Account billing state updates after Stripe
          webhook delivery — refresh the billing workspace in a few moments.
        </p>
        {sessionId ? (
          <p className={styles.vaultHint}>Session reference: {sessionId}</p>
        ) : null}
        <p className={styles.vaultHint}>
          <Link href={`/${lang}/portal/dashboard/billing`}>Return to billing workspace</Link>
        </p>
      </section>
    </WorkspaceRouteFrame>
  );
}
