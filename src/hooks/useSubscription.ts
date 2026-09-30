import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface SubscriptionFeature {
  id: string;
  title: string;
  included: boolean;
}

export interface SubscriptionPlan {
  planId: 'starter' | 'pro' | 'enterprise';
  planName: string;
  statusTag: string;
  isMaintenance: boolean;
  maintenanceTitle: string;
  maintenanceMessage: string;
  accountAddress: string;
  features: SubscriptionFeature[];
}

export interface PlanOption {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  price: number;
  billingPeriod: string;
  badge?: string;
  isPopular?: boolean;
  description: string;
  features: SubscriptionFeature[];
}

export const ALL_PLANS: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    billingPeriod: 'forever',
    description: 'Essential infrastructure for emerging web3 teams and individual builders.',
    features: [
      { id: 'sub-accounts', title: 'Sub-accounts', included: true },
      { id: 'payments', title: 'Payments', included: true },
      { id: 'token-management', title: 'Token management', included: true },
      { id: 'permissions', title: 'Permissions', included: false },
      { id: 'extension', title: 'SquadsX browser extension for app connectivity', included: false },
      { id: 'fee-relayer', title: 'Fee Relayer for gas abstraction', included: false },
      { id: 'spending-limits', title: 'Spending limits', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    billingPeriod: '/ month',
    badge: 'Popular',
    isPopular: true,
    description: 'Complete suite for fast-scaling organizations and active treasuries.',
    features: [
      { id: 'permissions', title: 'Permissions', included: true },
      { id: 'sub-accounts', title: 'Sub-accounts', included: true },
      { id: 'extension', title: 'SquadsX browser extension for app connectivity', included: true },
      { id: 'payments', title: 'Payments', included: true },
      { id: 'fee-relayer', title: 'Fee Relayer for gas abstraction', included: true },
      { id: 'spending-limits', title: 'Spending limits', included: true },
      { id: 'token-management', title: 'Token management', included: true },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    billingPeriod: '/ month',
    badge: 'Custom',
    description: 'Advanced governance, dedicated RPC nodes, and custom multisig controls.',
    features: [
      { id: 'permissions', title: 'Permissions & Custom Roles', included: true },
      { id: 'sub-accounts', title: 'Sub-accounts & Unlimited Vaults', included: true },
      { id: 'extension', title: 'SquadsX browser extension for app connectivity', included: true },
      { id: 'payments', title: 'Multi-token Payments & Custom Invoicing', included: true },
      { id: 'fee-relayer', title: 'Fee Relayer & Gas-free Relays', included: true },
      { id: 'spending-limits', title: 'Spending limits & Multisig controls', included: true },
      { id: 'token-management', title: 'Token management & Dedicated Treasury engine', included: true },
    ],
  },
];

export function useSubscription() {
  const { publicKey } = useWallet();
  const [data, setData] = useState<SubscriptionPlan | null>(null);
  const [activePlanId, setActivePlanId] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('luxor_active_plan');
      if (saved === 'starter' || saved === 'pro' || saved === 'enterprise') {
        setActivePlanId(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchSubscription = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');

    try {
      const walletStr = publicKey?.toBase58() || 'DEAh...DXtC';
      const currentPlanConfig = ALL_PLANS.find((p) => p.id === activePlanId) || ALL_PLANS[1];

      const planInfo: SubscriptionPlan = {
        planId: currentPlanConfig.id,
        planName: currentPlanConfig.name,
        statusTag: currentPlanConfig.id === 'pro' ? 'Complimentary' : 'Active',
        isMaintenance: true,
        maintenanceTitle: 'Billing Maintenance',
        maintenanceMessage:
          "Our subscription system is currently under maintenance. You'll still have access to the pro features listed, however you won't be billed for them during our maintenance time period.",
        accountAddress: walletStr,
        features: currentPlanConfig.features.filter((f) => f.included),
      };

      setData(planInfo);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, activePlanId]);

  const selectPlan = (planId: 'starter' | 'pro' | 'enterprise') => {
    setActivePlanId(planId);
    try {
      localStorage.setItem('luxor_active_plan', planId);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    data,
    activePlanId,
    availablePlans: ALL_PLANS,
    selectPlan,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchSubscription,
  };
}
