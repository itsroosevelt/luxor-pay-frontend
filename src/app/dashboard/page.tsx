'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { listPaymentLinks, listPosDevices } from '@/lib/payments-api';
import { listPaymentRequests } from '@/lib/payment-requests-api';
import { getLuxorEnv } from '@/lib/luxor-env';
import { Link as LinkIcon, Terminal, Code2, ArrowRight, RefreshCw, Bell, QrCode, ArrowUp } from 'lucide-react';
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
import { OverviewChart } from '@/components/dashboard/overview/OverviewChart';
import { AccountsTable } from '@/components/dashboard/overview/AccountsTable';
import { DashboardExtraPanelsContainer } from '@/components/dashboard/overview/DashboardExtraPanelsContainer';
import { TopWalletBar } from '@/components/dashboard/TopWalletBar';
import { useGetBalance } from '@/hooks/useGetBalance';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import { Transfer } from '@/lib/transfers-api';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { EyebrowBadge, HeroTitle, GlassCard } from '@/components/shared/DesignSystem';

const HeaderContainer = styled.header`
  padding: 18px 24px;
  border-bottom: 1px solid var(--lx-border);
  background: var(--lx-bg-elev);
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    padding: 18px 28px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const RefreshButton = styled.button`
  padding: 7px;
  color: var(--lx-text-muted);
  background: var(--lx-surface-2);
  border: 1px solid var(--lx-border);
  border-radius: var(--lx-radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.16s ease, background-color 0.16s ease, border-color 0.16s ease;

  &:hover {
    color: var(--lx-text);
    background: var(--lx-surface-hover);
    border-color: var(--lx-border-hover);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--lx-ring);
  }
`;

const StatCardLink = styled(motion(Link))`
  position: relative;
  background: var(--lx-surface);
  border: 1px solid var(--lx-border);
  border-radius: var(--lx-radius);
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  text-decoration: none;
  overflow: hidden;
  transition: background-color 0.16s ease, border-color 0.16s ease;

  &:hover {
    background: var(--lx-surface-hover);
    border-color: var(--lx-border-hover);
  }
`;

const StatArrowCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: var(--lx-surface-2);
  border: 1px solid var(--lx-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-text-dim);
  transition: color 0.16s ease, background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;

  ${StatCardLink}:hover & {
    background: var(--lx-accent-soft);
    border-color: var(--lx-accent-border);
    color: var(--lx-accent);
    transform: translate(1px, -1px);
  }
`;

const QuickLinkCard = styled(motion(Link))`
  background: var(--lx-surface);
  border: 1px solid var(--lx-border);
  border-radius: var(--lx-radius);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-decoration: none;
  transition: background-color 0.16s ease, border-color 0.16s ease;

  &:hover {
    background: var(--lx-surface-hover);
    border-color: var(--lx-border-hover);
  }
`;

const QuickIconCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: var(--lx-radius-sm);
  background: var(--lx-surface-2);
  border: 1px solid var(--lx-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-accent);
  flex-shrink: 0;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;

  ${QuickLinkCard}:hover & {
    background: var(--lx-accent-soft);
    border-color: var(--lx-accent-border);
    color: var(--lx-accent);
  }
`;

const QuickArrowCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: var(--lx-surface-2);
  border: 1px solid var(--lx-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--lx-text-dim);
  flex-shrink: 0;
  transition: color 0.16s ease, background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease;

  ${QuickLinkCard}:hover & {
    background: var(--lx-accent-soft);
    border-color: var(--lx-accent-border);
    color: var(--lx-accent);
    transform: translateX(3px);
  }
`;

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ links: 0, pos: 0, hasWallet: false });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPaymentRequestModalOpen, setIsPaymentRequestModalOpen] = useState(false);
  const [pendingInboxCount, setPendingInboxCount] = useState(0);

  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);

  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useGetBalance(merchantWallet);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [links, pos, profile] = await Promise.all([
          listPaymentLinks(token),
          listPosDevices(token),
          getMerchantProfile(token),
        ]);
        const wallet = profile?.merchantWallet || null;
        setStats({
          links: links.length,
          pos: pos.length,
          hasWallet: Boolean(wallet),
        });
        setMerchantWallet(wallet);
        setBusinessName(profile?.businessName?.trim() || null);

        if (wallet) {
          const env = getLuxorEnv();
          const inboxRes = await listPaymentRequests(token, 'payer', wallet);
          const pending = inboxRes.data.filter(r => r.status === 'PENDING');
          setPendingInboxCount(pending.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsStatsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* Top Header Row with Dashboard title */}
      <HeaderContainer>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HeroTitle style={{ fontSize: '26px' }}>Overview</HeroTitle>
            <RefreshButton
              type="button"
              onClick={() => refetchBalance()}
              title="Refresh dashboard data"
            >
              <RefreshCw size={16} className={isBalanceLoading ? "animate-spin" : ""} />
            </RefreshButton>
          </div>
          <p className="lx-page-subtitle">
            Your Solana payment platform — links, POS, and API in one place.
          </p>
        </div>

        {/* Top Wallet Bar with quick actions (mobile view) */}
        <div className="md:hidden">
          <TopWalletBar
            merchantWallet={merchantWallet}
            solBalance={balanceData?.solBalance}
            isLoading={isBalanceLoading}
            onQrClick={() => setIsQrModalOpen(true)}
            onSendClick={() => setIsTransferModalOpen(true)}
          />
        </div>
      </HeaderContainer>

      <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-8">
        {pendingInboxCount > 0 && (
          <Link
            href="/dashboard/requests"
            className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-white/[0.03]"
            style={{
              background: 'var(--lx-surface)',
              border: '1px solid var(--lx-border)',
              borderRadius: 'var(--lx-radius)',
              textDecoration: 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: '34px', height: '34px', borderRadius: 'var(--lx-radius-sm)',
                  background: 'var(--lx-fill)', border: '1px solid var(--lx-border)',
                }}
              >
                <Bell size={15} style={{ color: 'var(--lx-text-muted)' }} />
              </div>
              <div>
                <p className="flex items-center gap-2" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--lx-text)', margin: 0 }}>
                  <span
                    aria-hidden
                    style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--lx-success)', display: 'inline-block' }}
                  />
                  You have {pendingInboxCount} payment request{pendingInboxCount !== 1 ? 's' : ''} waiting for action
                </p>
                <p style={{ fontSize: '12px', color: 'var(--lx-text-muted)', margin: 0, fontWeight: 400 }}>
                  Click to review and pay or decline
                </p>
              </div>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--lx-text-dim)', flexShrink: 0 }} />
          </Link>
        )}

        {!isStatsLoading && !stats.hasWallet && (
          <GlassCard style={{ padding: '18px 20px', borderColor: 'rgba(245, 158, 11, 0.32)', background: 'rgba(245, 158, 11, 0.06)' }}>
            <p className="text-amber-200 text-sm" style={{ margin: 0 }}>
              Add your Solana wallet in{' '}
              <Link href="/dashboard/settings" className="underline font-medium text-amber-100">
                Settings
              </Link>{' '}
              to accept payments on links and POS.
            </p>
          </GlassCard>
        )}

        <WalletBalanceContainer
          merchantWallet={merchantWallet}
          onSendClick={() => setIsTransferModalOpen(true)}
          onDepositClick={() => setIsQrModalOpen(true)}
          onTradeClick={() => router.push('/dashboard/swap')}
          showExtraPanels={false}
        />

        {/* Balance-over-time chart + accounts / coins breakdown (Squads "Overview") */}
        {merchantWallet && <OverviewChart />}
        {merchantWallet && (
          <AccountsTable
            merchantWallet={merchantWallet}
            balanceData={balanceData}
            solBalance={balanceData?.solBalance}
            onSendClick={() => setIsTransferModalOpen(true)}
            onTradeClick={() => router.push('/dashboard/swap')}
          />
        )}

        {/* Limit orders · Inflows & Outflows · Stake · Managed assets */}
        {merchantWallet && <DashboardExtraPanelsContainer />}

        <div className="grid md:grid-cols-3 gap-5">
          <StatCard label="Payment links" value={stats.links} href="/dashboard/links" />
          <StatCard label="POS devices" value={stats.pos} href="/dashboard/settings?tab=pos" />
          <StatCard label="API" value="Ready" href="/dashboard/settings?tab=developers" isText />
        </div>

        <section className="pt-2">
          <EyebrowBadge style={{ marginBottom: '4px' }}>Ecosystem Accelerators</EyebrowBadge>
          <h2 className="text-xl font-semibold mb-4 tracking-tight" style={{ color: 'var(--lx-text)' }}>Quick start</h2>
          <div className="grid gap-3">
            <QuickLink
              href="/dashboard/links"
              icon={LinkIcon}
              title="Create a payment link"
              description="Share a checkout URL on your website or social media."
            />
            <QuickLink
              href="/dashboard/settings?tab=pos"
              icon={Terminal}
              title="Connect a POS terminal"
              description="Register hardware and charge with your API key."
            />
            <QuickLink
              href="/dashboard/settings?tab=developers"
              icon={Code2}
              title="Get API keys"
              description="Integrate Luxor Pay like Stripe — REST on the same domain."
            />
          </div>
        </section>
      </div>

      <TransferModal 
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={(data) => {
          setTransferSuccessData(data);
          setIsTransferSuccessModalOpen(true);
        }}
      />
      
      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        merchantWallet={merchantWallet}
        onAskForPayment={() => setIsPaymentRequestModalOpen(true)}
      />

      <PaymentRequestModal
        isOpen={isPaymentRequestModalOpen}
        onClose={() => setIsPaymentRequestModalOpen(false)}
        requesterWallet={merchantWallet}
      />
      <TransferSuccessModal
        isOpen={isTransferSuccessModalOpen}
        onClose={() => setIsTransferSuccessModalOpen(false)}
        transferData={transferSuccessData}
      />

      <QrOperationsModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        merchantWallet={merchantWallet}
        recipientLabel={businessName}
        initialMode="select"
        onCreatePaymentRequest={() => setIsPaymentRequestModalOpen(true)}
      />
    </>
  );
}

function StatCard({
  label,
  value,
  href,
  isText,
}: {
  label: string;
  value: number | string;
  href: string;
  isText?: boolean;
}) {
  return (
    <StatCardLink href={href} whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }}>
      <div className="flex items-center justify-between">
        <span className="lx-eyebrow">{label}</span>
        <StatArrowCircle>
          <ArrowRight size={13} />
        </StatArrowCircle>
      </div>
      <div>
        {isText ? (
          <span className="lx-status lx-status--ok">
            <span className="lx-status-dot" />
            {value}
          </span>
        ) : (
          <p className="text-4xl font-semibold tracking-tight leading-none" style={{ color: 'var(--lx-text)' }}>
            {value}
          </p>
        )}
      </div>
    </StatCardLink>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: typeof LinkIcon;
  title: string;
  description: string;
}) {
  return (
    <QuickLinkCard href={href} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
      <div className="flex items-center gap-4">
        <QuickIconCircle>
          <Icon size={20} />
        </QuickIconCircle>
        <div>
          <p className="font-semibold text-base leading-snug" style={{ color: 'var(--lx-text)' }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--lx-text-muted)' }}>{description}</p>
        </div>
      </div>
      <QuickArrowCircle>
        <ArrowRight size={16} />
      </QuickArrowCircle>
    </QuickLinkCard>
  );
}
