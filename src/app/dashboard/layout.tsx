import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Toaster } from 'sonner';
import { SolanaProvider } from '@/web3/providers/SolanaProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SolanaProvider>
      <DashboardShell>
        <Toaster theme="dark" position="top-right" />
        {children}
      </DashboardShell>
    </SolanaProvider>
  );
}
