import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Toaster } from 'sonner';
import { GeolocationProvider } from '@/context/GeolocationContext';
import { MerchantProvider } from '@/context/MerchantContext';
import { KycSocketProvider } from '@/context/KycSocketContext';
import { OnrampSocketProvider } from '@/context/OnrampSocketContext';
import { TreasuryAccountsProvider } from '@/context/TreasuryAccountsContext';

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
            <TreasuryAccountsProvider>
              <DashboardShell>
                <Toaster theme="dark" position="top-right" />
                {children}
              </DashboardShell>
            </TreasuryAccountsProvider>
          </OnrampSocketProvider>
        </KycSocketProvider>
      </MerchantProvider>
    </GeolocationProvider>
  );
}
