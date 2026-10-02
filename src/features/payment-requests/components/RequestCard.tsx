'use client';

import { useState } from 'react';
import { PaymentRequest } from '@/features/payment-requests/api/payment-requests-api';
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { Bell, Wallet, Calendar, Hash, ArrowRight, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';
import { StatusBadge, MetaItem, ActionButton } from './RequestsUi';
import { shortenWallet, formatAmount, formatDate } from './request-format';

export interface RequestCardProps {
  request: PaymentRequest;
  perspective: 'requester' | 'payer';
  network: 'mainnet-beta' | 'devnet';
  onRefetch: () => void;
  onPay?: (req: PaymentRequest) => void;
  onUpdate?: (req: PaymentRequest) => void;
  onResend?: (req: PaymentRequest) => void;
}

export function RequestCard({ request, perspective, network, onRefetch, onPay, onUpdate, onResend }: RequestCardProps) {
  const [isActing, setIsActing] = useState(false);

  const isPending = request.status === 'PENDING';
  const isExpired = request.status === 'EXPIRED';
  const showActions = isPending || (isExpired && perspective === 'requester');
  const { getTokenSymbol } = useTokenRegistry();
  const formattedAmount = formatAmount(request.amount, request.assetMint, network, getTokenSymbol);
  const expDate = formatDate(request.expirationDate);
  const createdDate = formatDate(request.createdAt);
  const lastRemindedDate = formatDate(request.lastNotificationDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
      style={{
        background: 'transparent',
        borderRadius: '0px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 600,
            color: '#FFFFFF',
            lineHeight: 1,
          }}>
            {formattedAmount}
          </span>
          {request.reference && (
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 300 }}>
              {request.reference}
            </span>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Meta Row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px' }}>
        <MetaItem icon={<Wallet size={13} />} label={perspective === 'payer' ? 'From' : 'To'}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#E2E8F0' }}>
            {shortenWallet(perspective === 'payer' ? request.requesterWallet : request.payerWallet)}
          </span>
        </MetaItem>

        {request.businessName && (
          <MetaItem icon={<Hash size={13} />} label="Business">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {request.businessName}
            </span>
          </MetaItem>
        )}

        {request.numericalReference && (
          <MetaItem icon={<Hash size={13} />} label="Ref #">
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {request.numericalReference}
            </span>
          </MetaItem>
        )}

        <MetaItem icon={<Calendar size={13} />} label="Created">
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
            {createdDate}
          </span>
        </MetaItem>

        {expDate && (
          <MetaItem icon={<Calendar size={13} />} label="Expires">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {expDate}
            </span>
          </MetaItem>
        )}

        {lastRemindedDate && (
          <MetaItem icon={<Bell size={13} />} label="Last Reminded">
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {lastRemindedDate}
            </span>
          </MetaItem>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
          {perspective === 'requester' && (
            <>
              {isPending && (
                <ActionButton
                  onClick={() => onResend?.(request)}
                  disabled={isActing}
                  icon={<Bell size={13} />}
                  variant="ghost"
                >
                  Resend Notification
                </ActionButton>
              )}
              <ActionButton
                onClick={() => onUpdate?.(request)}
                disabled={isActing}
                icon={<Pencil size={13} />}
                variant="danger"
              >
                Update
              </ActionButton>
            </>
          )}
          {perspective === 'payer' && isPending && (
            <ActionButton
              onClick={() => onPay?.(request)}
              disabled={isActing}
              icon={<ArrowRight size={13} />}
              variant="primary"
            >
              Pay {formattedAmount}
            </ActionButton>
          )}
        </div>
      )}
    </motion.div>
  );
}
