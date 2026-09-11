import { Metadata } from 'next';
import { TreasuryContainer } from '@/components/dashboard/treasury/TreasuryContainer';

export const metadata: Metadata = {
  title: 'Operating Vaults | Luxor Pay',
  description: 'Your on-chain treasury — total balance, coins, stakes, NFTs and accounts.',
};

export default function TreasuryPage() {
  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Operating Vaults</h1>
          <p className="lx-page-subtitle">
            Your on-chain treasury — total balance, coins, stakes, NFTs and accounts.
          </p>
        </div>
      </header>

      <TreasuryContainer />
    </>
  );
}



