import { Metadata } from 'next';
import { TreasuryContainer } from '@/components/dashboard/treasury/TreasuryContainer';

export const metadata: Metadata = {
  title: 'Treasury | Luxor Pay',
  description: 'Your on-chain treasury — total balance, coins, stakes, NFTs and accounts.',
};

export default function TreasuryPage() {
  return <TreasuryContainer />;
}

