import { Metadata } from 'next';
import { SwapContainer } from '@/components/dashboard/swap/SwapContainer';

export const metadata: Metadata = {
  title: 'Swap Tokens | Luxor Pay',
  description: 'Swap your Solana tokens seamlessly with Luxor Pay custodial swap.',
};

export default function SwapPage() {
  return (
    <div className="p-6 md:p-10">
      <SwapContainer />
    </div>
  );
}
