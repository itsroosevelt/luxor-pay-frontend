'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionView } from '@/components/dashboard/subscription/SubscriptionView';

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
