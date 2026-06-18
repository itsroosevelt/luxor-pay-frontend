'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { listPaymentLinks, listPosDevices } from '@/lib/payments-api';
import { Link as LinkIcon, Terminal, Code2, ArrowRight, Send, QrCode } from 'lucide-react';
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { Transfer } from '@/lib/transfers-api';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ links: 0, pos: 0, hasWallet: false });
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const [links, pos, profile] = await Promise.all([
          listPaymentLinks(token),
          listPosDevices(token),
          getMerchantProfile(token),
        ]);
        setStats({
          links: links.length,
          pos: pos.length,
          hasWallet: Boolean(profile?.merchantWallet),
        });
        setMerchantWallet(profile?.merchantWallet || null);
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
        <div className="flex gap-3">
          <button 
            onClick={() => setIsReceiveModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-blue-400/30 text-blue-400 font-medium hover:bg-white/5 transition-colors"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <QrCode size={18} /> Receive
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
      />

      <TransferSuccessModal
        isOpen={isTransferSuccessModalOpen}
        onClose={() => setIsTransferSuccessModalOpen(false)}
        transferData={transferSuccessData}
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
