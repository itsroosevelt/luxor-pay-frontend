'use client';

import Link from 'next/link';
import { PageHeader, EmptyState, WalletBanner } from '@/components/dashboard';
import { getSolanaNetworkLabel } from '@/lib/solana-env';
import { ShoppingCart } from 'lucide-react';

export default function PaymentsCheckoutPage() {
  return (
    <>
      <PageHeader
        title="Checkout"
        description={`Hosted Solana Pay checkout for SOL and USDC on ${getSolanaNetworkLabel()}.`}
        actions={
          <Link href="/dashboard/links" className="dash-btn-primary px-4 py-2 text-sm">
            Payment Links
          </Link>
        }
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <WalletBanner connected={false} />
        <EmptyState
          icon={ShoppingCart}
          title="Embed checkout on your site"
          description="Use payment links or the REST API to create Solana Pay URLs. Customers scan a QR or connect a wallet to pay on-chain — settlements go to your merchant wallet."
          action={{ label: 'Create payment link', href: '/dashboard/links' }}
        />
        <div className="dash-card p-6 text-sm text-[var(--dash-muted)] space-y-2">
          <p>
            <strong className="text-[var(--dash-text)]">Solana Pay flow:</strong> create order →
            show QR / deep link → verify signature on-chain → mark confirmed in Transactions.
          </p>
          <p>
            Public checkout routes: <code className="font-mono text-xs">/pay/[reference]</code> and{' '}
            <code className="font-mono text-xs">/pay/link/[id]</code>.
          </p>
        </div>
      </div>
    </>
  );
}
