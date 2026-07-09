import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Toaster } from 'sonner';
import { GeolocationProvider } from '@/context/GeolocationContext';
import { MerchantProvider } from '@/context/MerchantContext';
import { KycSocketProvider } from '@/context/KycSocketContext';
import { OnrampSocketProvider } from '@/context/OnrampSocketContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GeolocationProvider>
      <MerchantProvider>
        <KycSocketProvider>
          <OnrampSocketProvider>
            <DashboardShell>
              <Toaster theme="dark" position="top-right" />
              {children}
            </DashboardShell>
          </OnrampSocketProvider>
        </KycSocketProvider>
      </MerchantProvider>
    </GeolocationProvider>
  );
}
