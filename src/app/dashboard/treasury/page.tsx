import { Metadata } from 'next';
import { TreasuryContainer } from '@/components/dashboard/treasury/TreasuryContainer';

export const metadata: Metadata = {
  title: 'Treasury | Luxor Pay',
  description: 'Your on-chain treasury — total balance, coins and accounts.',
};

export default function TreasuryPage() {
  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Treasury</h1>
          <p className="lx-page-subtitle">Total balance, holdings and accounts across your Solana wallet.</p>
        </div>
      </header>

      <TreasuryContainer />
    </>
  );
}
