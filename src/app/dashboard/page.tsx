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
import { Link as LinkIcon, Terminal, Code2, ArrowRight, RefreshCw, Bell } from 'lucide-react';
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
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
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.01);
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    padding: 32px 40px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const RefreshButton = styled.button`
  padding: 6px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #FFFFFF;
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(96, 165, 250, 0.3);
  }

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }
`;

const StatCardLink = styled(motion(Link))`
  position: relative;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  text-decoration: none;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(96, 165, 250, 0.35);
    box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.5), 0 0 24px -6px rgba(37, 99, 235, 0.12);
  }
`;

const StatArrowCircle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;

  ${StatCardLink}:hover & {
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(96, 165, 250, 0.4);
    color: #FFFFFF;
    transform: translate(1px, -1px);
  }
`;

const QuickLinkCard = styled(motion(Link))`
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px);
  border-radius: 24px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-decoration: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(96, 165, 250, 0.35);
    box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.5), 0 0 24px -6px rgba(37, 99, 235, 0.12);
  }
`;

const QuickIconCircle = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60A5FA;
  flex-shrink: 0;
  transition: all 0.25s ease;

  ${QuickLinkCard}:hover & {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(96, 165, 250, 0.15));
    border-color: rgba(96, 165, 250, 0.45);
    color: #FFFFFF;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
  }
`;

const QuickArrowCircle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  transition: all 0.2s ease;

  ${QuickLinkCard}:hover & {
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(96, 165, 250, 0.4);
    color: #FFFFFF;
    transform: translateX(3px);
  }
`;

export default function DashboardOverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ links: 0, pos: 0, hasWallet: false });
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
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* Top Header Row with Dashboard title & Top Wallet Bar */}
      <HeaderContainer>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <HeroTitle style={{ fontSize: '32px' }}>Overview</HeroTitle>
            <RefreshButton
              type="button"
              onClick={() => refetchBalance()}
              title="Refresh dashboard data"
            >
              <RefreshCw size={16} className={isBalanceLoading ? "animate-spin" : ""} />
            </RefreshButton>
          </div>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Your Solana payment platform — links, POS, and API in one place.
          </p>
        </div>

        {/* Top Wallet Bar at top right (mobile only here, desktop is global) */}
        <div className="md:hidden">
          <TopWalletBar
            merchantWallet={merchantWallet}
            solBalance={balanceData?.solBalance}
            isLoading={isBalanceLoading}
          />
        </div>
      </HeaderContainer>

      <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto space-y-8">
        {!stats.hasWallet && (
          <GlassCard style={{ padding: '20px', borderColor: 'rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '24px' }}>
            <p className="text-amber-200 text-sm" style={{ fontFamily: 'Montserrat, sans-serif', margin: 0 }}>
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
        />

        {pendingInboxCount > 0 && (
          <Link
            href="/dashboard/requests"
            className="flex items-center justify-between gap-4 p-5 rounded-3xl border transition-all"
            style={{
              background: 'rgba(96,165,250,0.06)',
              borderColor: 'rgba(96,165,250,0.25)',
              textDecoration: 'none',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center gap-3">
              <div style={{
                width: '40px', height: '40px', borderRadius: '9999px',
                background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bell size={18} style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>
                  {pendingInboxCount} payment request{pendingInboxCount !== 1 ? 's' : ''} waiting for your action
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, fontWeight: 300 }}>
                  Review and pay or decline
                </p>
              </div>
            </div>
            <ArrowRight size={18} style={{ color: '#60A5FA', flexShrink: 0 }} />
          </Link>
        )}

        <div className="grid md:grid-cols-3 gap-5">
          <StatCard label="Payment links" value={stats.links} href="/dashboard/links" />
          <StatCard label="POS devices" value={stats.pos} href="/dashboard/settings?tab=pos" />
          <StatCard label="API" value="Ready" href="/dashboard/settings?tab=developers" isText />
        </div>

        <section className="pt-2">
          <EyebrowBadge style={{ marginBottom: '4px' }}>Ecosystem Accelerators</EyebrowBadge>
          <h2 className="text-2xl font-medium mb-4 text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick start</h2>
          <div className="grid gap-4">
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
    <StatCardLink href={href} whileHover={{ y: -3 }} whileTap={{ scale: 0.99 }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-white/50 font-['Outfit',sans-serif]">
          {label}
        </span>
        <StatArrowCircle>
          <ArrowRight size={13} />
        </StatArrowCircle>
      </div>
      <div>
        {isText ? (
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-sm font-semibold font-['Outfit',sans-serif]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {value}
          </span>
        ) : (
          <p className="text-4xl font-semibold font-['Outfit',sans-serif] text-white tracking-tight leading-none">
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
          <p className="font-semibold text-white font-['Outfit',sans-serif] text-base leading-snug">{title}</p>
          <p className="text-xs text-white/60 font-['Montserrat',sans-serif] font-light mt-0.5">{description}</p>
        </div>
      </div>
      <QuickArrowCircle>
        <ArrowRight size={16} />
      </QuickArrowCircle>
    </QuickLinkCard>
  );
}
