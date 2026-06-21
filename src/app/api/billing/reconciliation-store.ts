export type BillingInvoiceRecord = {
  invoiceId: string;
  billingCycle: string;
  amountPaid: number;
  tierTierSlug: string;
  status: "PAID" | "FAILED" | "PENDING";
  customerEmail: string;
  sessionId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  updatedAt: string;
};

const invoiceStore = new Map<string, BillingInvoiceRecord[]>();

function keyForEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function currentBillingCycle(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getBillingInvoices(email: string): BillingInvoiceRecord[] {
  return invoiceStore.get(keyForEmail(email)) ?? [];
}

export function upsertBillingInvoice(
  email: string,
  invoice: Omit<BillingInvoiceRecord, "customerEmail" | "updatedAt">,
): BillingInvoiceRecord {
  const key = keyForEmail(email);
  const current = invoiceStore.get(key) ?? [];
  const next: BillingInvoiceRecord = {
    ...invoice,
    customerEmail: email,
    updatedAt: new Date().toISOString(),
  };
  const withoutExisting = current.filter((item) => item.invoiceId !== next.invoiceId);
  invoiceStore.set(key, [next, ...withoutExisting].slice(0, 12));
  return next;
}
