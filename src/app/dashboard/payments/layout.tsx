import { SolanaProvider } from '@/web3/providers/SolanaProvider';

export default function PaymentsLayout({ children }: { children: React.ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
