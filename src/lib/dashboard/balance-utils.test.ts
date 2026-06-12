import { describe, expect, it } from 'vitest';
import type { PaymentOrder } from '@luxor/contracts';
import {
  computeBalanceSummary,
  filterActivityByTab,
  ordersToActivity,
  type BalanceActivityRow,
} from './balance-utils';

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

describe('computeBalanceSummary', () => {
  it('sums pending as incoming and confirmed as available for the currency', () => {
    const orders = [
      order({ amount: 5, status: 'pending', currency: 'USDC' }),
      order({ reference: 'ref-2', amount: 15, status: 'confirmed', currency: 'USDC' }),
      order({ reference: 'ref-3', amount: 100, status: 'confirmed', currency: 'SOL' }),
      order({ reference: 'ref-4', amount: 3, status: 'failed', currency: 'USDC' }),
    ];

    expect(computeBalanceSummary(orders, 'USDC')).toEqual({ incoming: 5, available: 15 });
  });

  it('returns zeros when no orders match the currency', () => {
    expect(computeBalanceSummary([order({ currency: 'SOL' })], 'USDC')).toEqual({
      incoming: 0,
      available: 0,
    });
  });
});

describe('filterActivityByTab', () => {
  const rows: BalanceActivityRow[] = [
    ...ordersToActivity([order()]),
    {
      id: 't1',
      amount: 1,
      currency: 'USDC',
      status: 'paid',
      destination: 'dest',
      type: 'transfer',
      typeLabel: 'Transfer',
      createdAt: '2026-01-02T00:00:00.000Z',
      availableOn: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'top1',
      amount: 2,
      currency: 'USDC',
      status: 'paid',
      destination: 'dest',
      type: 'topup',
      typeLabel: 'Top-up',
      createdAt: '2026-01-03T00:00:00.000Z',
      availableOn: '2026-01-03T00:00:00.000Z',
    },
  ];

  it('filters transfers and topups tabs', () => {
    expect(filterActivityByTab(rows, 'transfers')).toHaveLength(1);
    expect(filterActivityByTab(rows, 'transfers')[0]?.type).toBe('transfer');
    expect(filterActivityByTab(rows, 'topups')).toHaveLength(1);
    expect(filterActivityByTab(rows, 'topups')[0]?.type).toBe('topup');
  });

  it('returns all rows for the all tab', () => {
    expect(filterActivityByTab(rows, 'all')).toHaveLength(3);
  });
});
