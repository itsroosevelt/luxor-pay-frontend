import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Toaster } from 'sonner';
import { GeolocationProvider } from '@/context/GeolocationContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GeolocationProvider>
      <DashboardShell>
        <Toaster theme="dark" position="top-right" />
        {children}
      </DashboardShell>
    </GeolocationProvider>
  );
}
