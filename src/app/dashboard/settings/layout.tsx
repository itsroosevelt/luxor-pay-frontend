import { SolanaProvider } from '@/web3/providers/SolanaProvider';

export default function DashboardSettingsLayout({ children }: { children: React.ReactNode }) {
  return <SolanaProvider>{children}</SolanaProvider>;
}
