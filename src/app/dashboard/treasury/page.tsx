import { Metadata } from 'next';
import { TreasuryContainer } from '@/features/treasury/components/TreasuryContainer';

export const metadata: Metadata = {
  title: 'Treasury | Sterling',
  description: 'Your on-chain treasury — total balance, holdings and accounts across your Solana wallet.',
};

export default function TreasuryPage() {
  return <TreasuryContainer />;
}



