import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { Toaster } from 'sonner';
import { GeolocationProvider } from '@/context/GeolocationContext';
import { MerchantProvider } from '@/features/merchant/context/MerchantContext';
import { KycSocketProvider } from '@/features/onramp/context/KycSocketContext';
import { OnrampSocketProvider } from '@/features/onramp/context/OnrampSocketContext';

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
