import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Toaster } from 'sonner';
import { GeolocationProvider } from '@/context/GeolocationContext';
import { MerchantProvider } from '@/context/MerchantContext';
import { KycSocketProvider } from '@/context/KycSocketContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GeolocationProvider>
      <MerchantProvider>
        <KycSocketProvider>
          <DashboardShell>
            <Toaster theme="dark" position="top-right" />
            {children}
          </DashboardShell>
        </KycSocketProvider>
      </MerchantProvider>
    </GeolocationProvider>
  );
}
