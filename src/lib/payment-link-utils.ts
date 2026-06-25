export function isOpenAmountLink(link: { amount?: number | null }): boolean {
  return link.amount == null;
}

export function formatPaymentLinkAmount(link: {
  amount?: number | null;
  currency: string;
}): string {
  if (isOpenAmountLink(link)) {
    return `Open amount · ${link.currency}`;
  }
  return `${link.amount} ${link.currency}`;
}
