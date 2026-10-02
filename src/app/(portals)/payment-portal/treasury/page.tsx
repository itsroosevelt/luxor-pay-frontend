import { Metadata } from 'next';
import { TreasuryContainer } from '@/features/treasury/components/TreasuryContainer';

export const metadata: Metadata = {
  title: 'Balances & Treasury | Sterling',
  description: 'Manage treasury balances and operational vaults in the POS portal.',
};

export default function PortalTreasuryPage() {
  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Balances &amp; Treasury</h1>
          <p className="lx-page-subtitle">Global balance, operating vaults, and liquidity on the Sterling network.</p>
        </div>
      </header>

      <TreasuryContainer />
    </>
  );
}


