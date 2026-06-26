'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { listPaymentLinks, listPosDevices } from '@/lib/payments-api';
import { listPaymentRequests } from '@/lib/payment-requests-api';
import { getLuxorEnv } from '@/lib/luxor-env';
import { Link as LinkIcon, Terminal, Code2, ArrowRight, Send, QrCode, Bell } from 'lucide-react';
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import { Transfer } from '@/lib/transfers-api';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';

export default function DashboardOverviewPage() {
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
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Overview</h1>
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Your Solana payment platform — links, POS, and API in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-blue-400/30 text-blue-400 font-medium hover:bg-white/5 transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <QrCode size={18} /> Charge with QR
          </button>
          <button 
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-medium hover:bg-blue-600 hover:text-white transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <Send size={18} /> Transfer
          </button>
        </div>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        {!stats.hasWallet && (
          <div className="glass-panel p-4 border border-amber-500/30 bg-amber-500/5 text-sm">
            <p className="text-amber-200">
              Add your Solana wallet in{' '}
              <Link href="/dashboard/settings" className="underline font-medium">
                Settings
              </Link>{' '}
              to accept payments on links and POS.
            </p>
          </div>
        )}

        <WalletBalanceContainer merchantWallet={merchantWallet} />

        {pendingInboxCount > 0 && (
          <Link
            href="/dashboard/requests"
            className="flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors"
            style={{
              background: 'rgba(96,165,250,0.06)',
              borderColor: 'rgba(96,165,250,0.2)',
              textDecoration: 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <div style={{
                width: '36px', height: '36px', borderRadius: '9999px',
                background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bell size={16} style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 500, color: '#FFFFFF', margin: 0 }}>
                  {pendingInboxCount} payment request{pendingInboxCount !== 1 ? 's' : ''} waiting for your action
                </p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 300 }}>
                  Review and pay or decline
                </p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#60A5FA', flexShrink: 0 }} />
          </Link>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <StatCard label="Payment links" value={stats.links} href="/dashboard/links" />
          <StatCard label="POS devices" value={stats.pos} href="/dashboard/pos" />
          <StatCard label="API" value="Ready" href="/dashboard/developers" isText />
        </div>

        

        <section>
          <h2 className="text-lg font-semibold mb-4">Quick start</h2>
          <div className="grid gap-3">
            <QuickLink
              href="/dashboard/links"
              icon={LinkIcon}
              title="Create a payment link"
              description="Share a checkout URL on your website or social media."
            />
            <QuickLink
              href="/dashboard/pos"
              icon={Terminal}
              title="Connect a POS terminal"
              description="Register hardware and charge with your API key."
            />
            <QuickLink
              href="/dashboard/developers"
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
        initialMode="receive"
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
    <Link href={href} className="glass-panel p-6 hover:bg-white/[0.04] transition-colors block">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={isText ? 'text-xl font-bold text-primary' : 'text-3xl font-bold'}>{value}</p>
    </Link>
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
    <Link
      href={href}
      className="glass-panel p-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <ArrowRight className="text-gray-500 shrink-0" size={18} />
    </Link>
  );
}
