'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionView } from '@/components/dashboard/subscription/SubscriptionView';

export default function SubscriptionPage() {
  const { data, isLoading, isError, errorMessage, refetch } = useSubscription();

  return (
    <SubscriptionView
      subscription={data}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      onRefetch={refetch}
    />
  );
}
