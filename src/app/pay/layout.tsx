import { SolanaProvider } from '@/web3/providers/SolanaProvider';
import { Toaster } from 'sonner';

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return (
    <SolanaProvider>
      <Toaster theme="dark" position="top-center" />
      {children}
    </SolanaProvider>
  );
}
