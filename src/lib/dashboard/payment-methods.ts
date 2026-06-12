export type PaymentMethodStatus = 'enabled' | 'disabled' | 'action_required';

export interface SolanaPaymentMethod {
  id: string;
  name: string;
  status: PaymentMethodStatus;
  type: string;
  regions: string;
}

export const SOLANA_PAYMENT_METHODS: SolanaPaymentMethod[] = [
  {
    id: 'solana-wallet',
    name: 'Solana Wallet (Phantom, etc.)',
    status: 'enabled',
    type: 'Wallet connect',
    regions: 'Global',
  },
  {
    id: 'solana-pay-qr',
    name: 'Solana Pay QR',
    status: 'enabled',
    type: 'QR / deep link',
    regions: 'Global',
  },
  {
    id: 'usdc-solana',
    name: 'USDC on Solana',
    status: 'enabled',
    type: 'SPL token',
    regions: 'Global',
  },
  {
    id: 'sol-native',
    name: 'SOL native',
    status: 'enabled',
    type: 'Native',
    regions: 'Global',
  },
];

export type MethodSummaryFilter = 'all' | 'enabled' | 'disabled' | 'action_required';

export function countMethodsByStatus(methods: SolanaPaymentMethod[]) {
  return {
    all: methods.length,
    enabled: methods.filter((m) => m.status === 'enabled').length,
    disabled: methods.filter((m) => m.status === 'disabled').length,
    action_required: methods.filter((m) => m.status === 'action_required').length,
  };
}

export function filterMethodsBySummary(
  methods: SolanaPaymentMethod[],
  filter: MethodSummaryFilter
): SolanaPaymentMethod[] {
  if (filter === 'all') return methods;
  return methods.filter((m) => m.status === filter);
}

export function statusLabel(status: PaymentMethodStatus): string {
  switch (status) {
    case 'enabled':
      return 'Enabled';
    case 'disabled':
      return 'Disabled';
    case 'action_required':
      return 'Action required';
  }
}
