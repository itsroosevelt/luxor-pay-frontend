import { describe, expect, it } from 'vitest';
import type { PaymentOrder } from '@luxor/contracts';
import { computePaymentStatusCounts, filterPaymentsBySummary } from './transaction-utils';

function order(overrides: Partial<PaymentOrder> = {}): PaymentOrder {
  return {
    reference: 'ref-1',
    merchantId: 'm1',
    amount: 10,
    currency: 'USDC',
    recipient: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    status: 'pending',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('computePaymentStatusCounts', () => {
  it('counts statuses and leaves refunded/disputed at zero', () => {
    const orders = [
      order({ status: 'confirmed' }),
      order({ reference: 'ref-2', status: 'confirmed' }),
      order({ reference: 'ref-3', status: 'pending' }),
      order({ reference: 'ref-4', status: 'failed' }),
      order({ reference: 'ref-5', status: 'expired' }),
    ];

    expect(computePaymentStatusCounts(orders)).toEqual({
      all: 5,
      succeeded: 2,
      refunded: 0,
      disputed: 0,
      failed: 2,
      uncaptured: 1,
    });
  });
});

describe('filterPaymentsBySummary', () => {
  const orders = [
    order({ reference: 'a', status: 'confirmed' }),
    order({ reference: 'b', status: 'pending' }),
    order({ reference: 'c', status: 'failed' }),
    order({ reference: 'd', status: 'expired' }),
  ];

  it('filters by summary key', () => {
    expect(filterPaymentsBySummary(orders, 'succeeded').map((o) => o.reference)).toEqual(['a']);
    expect(filterPaymentsBySummary(orders, 'uncaptured').map((o) => o.reference)).toEqual(['b']);
    expect(filterPaymentsBySummary(orders, 'failed').map((o) => o.reference)).toEqual(['c', 'd']);
    expect(filterPaymentsBySummary(orders, 'refunded')).toEqual([]);
    expect(filterPaymentsBySummary(orders, 'all')).toHaveLength(4);
  });
});
