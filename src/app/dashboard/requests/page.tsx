'use client';

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { useGetPaymentRequests } from '@/hooks/useGetPaymentRequests';
import {
  PaymentRequest,
  cancelPaymentRequest,
  resendPaymentRequestNotification,
} from '@/lib/payment-requests-api';
import { getTokenSymbol } from '@/lib/token-registry';
import { getLuxorEnv } from '@/lib/luxor-env';
import {
  Inbox,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  Ban,
  ExternalLink,
  Wallet,
  Calendar,
  Hash,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortenWallet(addr: string) {
  if (!addr) return '—';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatAmount(amount: string, mint: string, network: 'mainnet-beta' | 'devnet') {
  const symbol = getTokenSymbol(mint, network) || 'SPL';
  return `${amount} ${symbol}`;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', Icon: Clock },
  PAID:    { label: 'Paid',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.2)',  Icon: CheckCircle2 },
  EXPIRED: { label: 'Expired', color: '#6B7280', bg: 'rgba(107,114,128,0.1)',border: 'rgba(107,114,128,0.2)',Icon: XCircle },
  CANCELLED:{ label: 'Cancelled',color:'#EF4444', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.2)',  Icon: Ban },
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentRequest['status'] }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const { Icon } = cfg;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '9999px',
      fontSize: '11px', fontWeight: 600, fontFamily: 'Outfit, sans-serif',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '64px 24px', gap: '12px',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: '56px', height: '56px', borderRadius: '9999px',
        background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(96,165,250,0.5)',
      }}>
        <Inbox size={24} />
      </div>
      <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
        {label}
      </p>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.06)', padding: '20px 24px',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      {[80, 60, 40].map((w, i) => (
        <div key={i} style={{
          height: '14px', width: `${w}%`, borderRadius: '6px',
          background: 'linear-gradient(90deg, rgba(37,99,235,0.08) 25%, rgba(96,165,250,0.15) 50%, rgba(37,99,235,0.08) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }} />
      ))}
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  request: PaymentRequest;
  perspective: 'requester' | 'payer';
  network: 'mainnet-beta' | 'devnet';
  onRefetch: () => void;
}

function RequestCard({ request, perspective, network, onRefetch }: RequestCardProps) {
  const [isActing, setIsActing] = useState(false);

  const handleResend = async () => {
    setIsActing(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      await resendPaymentRequestNotification(token, request.id);
      toast.success('Notification resent successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to resend notification');
    } finally {
      setIsActing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this payment request?')) return;
    setIsActing(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');
      const token = await user.getIdToken();
      await cancelPaymentRequest(token, request.id);
      toast.success('Payment request cancelled');
      onRefetch();
    } catch (e: any) {
      toast.error(e.message || 'Failed to cancel request');
    } finally {
      setIsActing(false);
    }
  };

  const isPending = request.status === 'PENDING';
  const formattedAmount = formatAmount(request.amount, request.assetMint, network);
  const expDate = formatDate(request.expirationDate);
  const createdDate = formatDate(request.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
    >
      {/* Top Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontFamily: 'Outfit, sans-serif', fontSize: '22px', fontWeight: 600,
            background: 'linear-gradient(to right, #60A5FA, #2563EB)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
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
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#60A5FA' }}>
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
      </div>

      {/* Actions */}
      {isPending && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
          {perspective === 'requester' && (
            <>
              <ActionButton
                onClick={handleResend}
                disabled={isActing}
                icon={<Bell size={13} />}
                variant="ghost"
              >
                Resend Notification
              </ActionButton>
              <ActionButton
                onClick={handleCancel}
                disabled={isActing}
                icon={<Ban size={13} />}
                variant="danger"
              >
                Cancel Request
              </ActionButton>
            </>
          )}
          {perspective === 'payer' && (
            <ActionButton
              onClick={() => toast.info('Payment flow — coming soon')}
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

function MetaItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{icon}</span>
      <span style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}:
      </span>
      {children}
    </div>
  );
}

function ActionButton({
  children, onClick, disabled, icon, variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  variant: 'primary' | 'ghost' | 'danger';
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'linear-gradient(135deg,#2563EB,#3B82F6)', color: '#FFFFFF', border: 'none' },
    ghost:   { background: 'rgba(96,165,250,0.08)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' },
    danger:  { background: 'rgba(239,68,68,0.08)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.2)' },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '7px 14px', borderRadius: '9999px',
        fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition: 'all 0.2s',
      }}
    >
      {icon}{children}
    </button>
  );
}

// ─── Tab Panel ────────────────────────────────────────────────────────────────

function RequestsPanel({
  perspective,
  walletAddress,
  network,
}: {
  perspective: 'requester' | 'payer';
  walletAddress: string | null;
  network: 'mainnet-beta' | 'devnet';
}) {
  const { data, isLoading, isError, errorMessage, refetch } = useGetPaymentRequests(perspective, walletAddress);

  if (!walletAddress) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'Montserrat, sans-serif', fontSize: '14px' }}>
        Configure your wallet in{' '}
        <Link href="/dashboard/settings" style={{ color: '#60A5FA', textDecoration: 'underline' }}>
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
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    const emptyLabel = perspective === 'payer'
      ? 'No payment requests received'
      : 'No payment requests sent';
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map(req => (
        <RequestCard
          key={req.id}
          request={req}
          perspective={perspective}
          network={network}
          onRefetch={refetch}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = 'inbox' | 'sent';

export default function PaymentRequestsPage() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const network = getLuxorEnv() === 'development' ? 'devnet' : 'mainnet-beta';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const profile = await getMerchantProfile(token);
        setMerchantWallet(profile?.merchantWallet || null);
      } catch (e) {
        console.error(e);
      }
    });
    return () => unsubscribe();
  }, []);

  const tabs: { id: TabId; label: string; Icon: typeof Inbox; description: string }[] = [
    { id: 'inbox',  label: 'Inbox',     Icon: Inbox, description: 'Requests others sent you' },
    { id: 'sent',   label: 'Sent',      Icon: Send,  description: 'Requests you sent to others' },
  ];

  return (
    <>
      {/* Global shimmer keyframe */}
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>

      <header style={{
        padding: '24px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '24px', fontWeight: 600, color: '#FFFFFF', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            Payment Requests
          </h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            Track payments you've requested and payments others are asking from you.
          </p>
        </div>
      </header>

      <div style={{ padding: '24px', maxWidth: '860px', margin: '0 auto' }}>

        {/* Tab Bar */}
        <div style={{
          display: 'flex', gap: '4px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '4px',
          marginBottom: '24px',
          width: 'fit-content',
        }}>
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '9px 18px', borderRadius: '12px', border: 'none',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: isActive ? 500 : 400,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: isActive ? '0 1px 8px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Tab Description */}
        <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '16px' }}>
          {tabs.find(t => t.id === activeTab)?.description}
        </p>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'inbox' && (
              <RequestsPanel perspective="payer" walletAddress={merchantWallet} network={network} />
            )}
            {activeTab === 'sent' && (
              <RequestsPanel perspective="requester" walletAddress={merchantWallet} network={network} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
