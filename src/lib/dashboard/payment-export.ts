import type { PaymentOrder } from '@luxor/contracts';
import { paymentCustomerLabel, paymentMethodLabel, paymentStatusLabels } from '@/lib/transaction-utils';

function escapeCsvField(value: string | number | undefined | null): string {
  const str = value == null ? '' : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function paymentToCsvRow(order: PaymentOrder): string {
  return [
    order.reference,
    order.amount,
    order.currency,
    paymentStatusLabels[order.status],
    order.createdAt,
    order.confirmedAt ?? '',
    order.signature ?? '',
    order.recipient,
    order.linkId ?? '',
    paymentCustomerLabel(order),
    paymentMethodLabel(order),
    order.label ?? '',
    order.message ?? '',
  ]
    .map(escapeCsvField)
    .join(',');
}

const CSV_HEADERS = [
  'reference',
  'amount',
  'currency',
  'status',
  'created_at',
  'confirmed_at',
  'signature',
  'recipient',
  'link_id',
  'customer',
  'method',
  'label',
  'message',
];

export function buildPaymentsCsv(orders: PaymentOrder[]): string {
  const header = CSV_HEADERS.join(',');
  const rows = orders.map(paymentToCsvRow);
  return [header, ...rows].join('\n');
}

export function downloadPaymentsCsv(orders: PaymentOrder[], filename?: string): void {
  const csv = buildPaymentsCsv(orders);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download =
    filename ?? `luxor-payments-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
