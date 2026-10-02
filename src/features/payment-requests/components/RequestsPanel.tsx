'use client';

import { useState } from 'react';
import { useGetPaymentRequests } from '@/features/payment-requests/hooks/useGetPaymentRequests';
import { PaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { PaymentModal } from './PayRequestModal';
import { RequestCard } from './RequestCard';
import { EmptyState, SkeletonCard } from './RequestsUi';
import { ResendModal } from './ResendRequestModal';
import { UpdateModal } from './UpdateRequestModal';

export type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';

export function RequestsPanel({
  perspective,
  walletAddress,
  network,
  statusFilter,
  searchQuery,
}: {
  perspective: 'requester' | 'payer';
  walletAddress: string | null;
  network: 'mainnet-beta' | 'devnet';
  statusFilter: StatusFilter;
  searchQuery: string;
}) {
  const { data, isLoading, isError, errorMessage, refetch } = useGetPaymentRequests(perspective, walletAddress);
  const [payingRequest, setPayingRequest] = useState<PaymentRequest | null>(null);
  const [updatingRequest, setUpdatingRequest] = useState<PaymentRequest | null>(null);
  const [resendingRequest, setResendingRequest] = useState<PaymentRequest | null>(null);

  if (!walletAddress) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif', fontSize: '14px' }}>
        Configure your wallet in{' '}
        <Link href="/dashboard/settings" style={{ color: '#E2E8F0', textDecoration: 'underline' }}>
          Settings
        </Link>{' '}
        to view payment requests.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px',
        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '16px', color: '#FCA5A5', fontFamily: 'Montserrat, sans-serif', fontSize: '14px',
      }}>
        <AlertCircle size={18} />
        <span>{errorMessage || 'Failed to load payment requests.'}</span>
        <button
          onClick={refetch}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#E2E8F0', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  const filteredData = data.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReference = req.reference?.toLowerCase().includes(q);
      const matchBusiness = req.businessName?.toLowerCase().includes(q);
      const matchNumRef = req.numericalReference?.toString().includes(q);
      const matchPayer = req.payerWallet?.toLowerCase().includes(q);
      const matchRequester = req.requesterWallet?.toLowerCase().includes(q);
      const matchTargetNotif = req.targetNotification?.toLowerCase().includes(q);
      return Boolean(matchReference || matchBusiness || matchNumRef || matchPayer || matchRequester || matchTargetNotif);
    }
    return true;
  });

  if (filteredData.length === 0) {
    const emptyLabel = perspective === 'payer'
      ? 'No payment requests received'
      : 'No payment requests sent';
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredData.map(req => (
          <RequestCard
            key={req.id}
            request={req}
            perspective={perspective}
            network={network}
            onRefetch={refetch}
            onPay={r => setPayingRequest(r)}
            onUpdate={r => setUpdatingRequest(r)}
            onResend={r => setResendingRequest(r)}
          />
        ))}
      </div>

      {payingRequest && (
        <PaymentModal
          request={payingRequest}
          network={network}
          onClose={() => setPayingRequest(null)}
          onSuccess={() => { setPayingRequest(null); refetch(); }}
        />
      )}

      {updatingRequest && (
        <UpdateModal
          request={updatingRequest}
          onClose={() => setUpdatingRequest(null)}
          onSuccess={() => { setUpdatingRequest(null); refetch(); }}
        />
      )}

      {resendingRequest && (
        <ResendModal
          request={resendingRequest}
          onClose={() => setResendingRequest(null)}
          onSuccess={() => { setResendingRequest(null); refetch(); }}
        />
      )}
    </>
  );
}
