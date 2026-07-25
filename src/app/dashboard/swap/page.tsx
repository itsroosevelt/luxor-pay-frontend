import { Metadata } from 'next';
import { SwapContainer } from '@/components/dashboard/swap/SwapContainer';

export const metadata: Metadata = {
  title: 'Swap Tokens | Luxor Pay',
  description: 'Swap your Solana tokens seamlessly with Luxor Pay custodial swap.',
};

export default function SwapPage() {
  return (
    <>
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Swap</h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Exchange your Solana tokens seamlessly with Luxor Pay custodial swap.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
        <SwapContainer />
      </div>
    </>
  );
}
