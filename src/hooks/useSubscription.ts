import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface SubscriptionFeature {
  id: string;
  title: string;
  included: boolean;
}

export interface SubscriptionPlan {
  planName: string;
  statusTag: string;
  isMaintenance: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  accountAddress: string;
  features: SubscriptionFeature[];
}

export function useSubscription() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      // Simulated fetch or future API integration
      const walletStr = publicKey?.toBase58() || 'DEAh...DXtC';
      
      const planInfo: SubscriptionPlan = {
        planName: 'Pro',
        statusTag: 'Complimentary',
        isMaintenance: true,
        maintenanceTitle: 'Billing Maintenance',
        maintenanceMessage:
          "Our subscription system is currently under maintenance. You'll still have access to the pro features listed, however you won't be billed for them during our maintenance time period.",
        accountAddress: walletStr,
        features: [
          { id: 'permissions', title: 'Permissions & Roles', included: true },
          { id: 'sub-accounts', title: 'Sub-accounts & Vaults', included: true },
          { id: 'extension', title: 'Luxor Pay browser extension for app connectivity', included: true },
          { id: 'payments', title: 'Multi-token Payments & Invoicing', included: true },
          { id: 'fee-relayer', title: 'Fee Relayer for gas abstraction', included: true },
          { id: 'spending-limits', title: 'Spending limits & Multisig controls', included: true },
          { id: 'token-management', title: 'Token management & Treasury engine', included: true },
        ],
      };

      setData(planInfo);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    data,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchSubscription,
  };
}
