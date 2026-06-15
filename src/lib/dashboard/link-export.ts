import type { PaymentLink } from '@luxor/contracts';
import { getPaymentLinkPublicUrl } from '@/lib/payment-link-utils';

function escapeCsvField(value: string | number | boolean | undefined | null): string {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function linkToCsvRow(link: PaymentLink): string {
  return [
    link.id,
    link.name,
    link.amount,
    link.currency,
    link.active ? 'active' : 'inactive',
    link.slug ?? '',
    getPaymentLinkPublicUrl(link),
    link.collectTaxes ? 'yes' : 'no',
    link.collectEmail ? 'yes' : 'no',
    link.createdAt,
  ]
    .map(escapeCsvField)
    .join(',');
}

const CSV_HEADERS = [
  'id',
  'name',
  'amount',
  'currency',
  'status',
  'slug',
  'public_url',
  'collect_taxes',
  'collect_email',
  'created_at',
];

export function buildPaymentLinksCsv(links: PaymentLink[]): string {
  const header = CSV_HEADERS.join(',');
  const rows = links.map(linkToCsvRow);
  return [header, ...rows].join('\n');
}

export function downloadPaymentLinksCsv(links: PaymentLink[], filename?: string): void {
  const csv = buildPaymentLinksCsv(links);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download =
    filename ?? `luxor-payment-links-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
