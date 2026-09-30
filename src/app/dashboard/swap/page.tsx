import { Metadata } from 'next';
import { SwapContainer } from '@/components/dashboard/swap/SwapContainer';

export const metadata: Metadata = {
  title: 'Swap Tokens | Sterling',
  description: 'Swap your Solana tokens seamlessly with Sterling custodial swap.',
};

export default function SwapPage() {
  return (
    <>
      <header className="lx-page-header flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="lx-page-title">Swap</h1>
          <p className="lx-page-subtitle">
            Exchange your Solana tokens seamlessly with Sterling custodial swap.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
        <SwapContainer />
      </div>
    </>
  );
}
