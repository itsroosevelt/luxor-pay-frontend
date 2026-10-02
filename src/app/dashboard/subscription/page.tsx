'use client';

import React from 'react';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import { SubscriptionView } from '@/features/subscription/components/SubscriptionView';

export default function SubscriptionPage() {
  const { data, activePlanId, availablePlans, selectPlan, isLoading, isError, errorMessage, refetch } = useSubscription();

  return (
    <SubscriptionView
      subscription={data}
      activePlanId={activePlanId}
      availablePlans={availablePlans}
      onSelectPlan={selectPlan}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      onRefetch={refetch}
    />
  );
}
