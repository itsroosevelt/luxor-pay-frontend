import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Toaster } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <Toaster theme="dark" position="top-right" />
      {children}
    </DashboardShell>
  );
}
