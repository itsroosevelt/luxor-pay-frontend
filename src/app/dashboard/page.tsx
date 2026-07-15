'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { listPaymentLinks, listPosDevices } from '@/lib/payments-api';
import { listPaymentRequests } from '@/lib/payment-requests-api';
import { getLuxorEnv } from '@/lib/luxor-env';
import { ArrowRight, Send, QrCode, Bell, ArrowLeftRight, ChevronDown, Copy, Check, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildOpenAmountQrUrl } from '@/lib/solana-pay-url';
import { useGetBalance } from '@/hooks/useGetBalance';
import { useTreasuryAccounts } from '@/context/TreasuryAccountsContext';
import { useMerchant } from '@/context/MerchantContext';
import { LoadingVideo } from '@/components/shared/LoadingVideo';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import { Transfer } from '@/lib/transfers-api';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { FundWalletButton } from '@/components/dashboard/FundWalletButton';
import { clsx } from 'clsx';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ links: 0, pos: 0, hasWallet: false });
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('total');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPaymentRequestModalOpen, setIsPaymentRequestModalOpen] = useState(false);
  const [pendingInboxCount, setPendingInboxCount] = useState(0);
  const [walletCopied, setWalletCopied] = useState(false);

  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);

  // Shared treasury accounts (Genesis + any user-created wallet).
  const { accounts } = useTreasuryAccounts();
  const { data: balanceData, isLoading: balanceLoading } = useGetBalance(merchantWallet);

  // KYC state comes from the shared MerchantContext (populated by the backend
  // via ensureMerchantProfile). We reuse the global KycModal for the flow.
  const { profile, setIsKycModalOpen } = useMerchant();
  const kycStatusRaw = (profile?.kycStatus || '').toLowerCase();
  const kycVerified = profile?.kyc === true || kycStatusRaw === 'verified';
  const kycProcessing =
    !kycVerified &&
    ['processing', 'pending', 'submitted', 'requires_input', 'in_review', 'reviewing'].includes(kycStatusRaw);

  // Balance comes straight from on-chain data for the Genesis wallet. We never
  // fabricate values: while it loads we show the indicator, and if the wallet is
  // empty we show nothing (—) instead of a made-up amount.
  const genesisPending = !merchantWallet;
  const genesisLoading = genesisPending || balanceLoading;
  const genesisSol = balanceData ? parseFloat(balanceData.solBalance) : null;

  const formatSol = (value: number) =>
    value.toLocaleString('en-US', { maximumFractionDigits: 4 });

  const accountOptions = [{ id: 'total', name: 'Total' }, ...accounts];
  const selectedOption = accountOptions.find((o) => o.id === selectedAccountId) ?? accountOptions[0];
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Whether the currently selected balance should render the loading indicator.
  const balanceIsLoading =
    (selectedAccountId === 'total' && genesisLoading) ||
    (Boolean(selectedAccount?.isGenesis) && genesisLoading);

  // Real SOL balance for the selected account. Only the Genesis wallet has an
  // on-chain balance from the backend; other accounts have none yet (null).
  const selectedSol =
    selectedAccountId === 'total' || selectedAccount?.isGenesis ? genesisSol : null;

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

  const handleCopyWallet = () => {
    if (!merchantWallet) return;
    navigator.clipboard.writeText(merchantWallet).then(() => {
      setWalletCopied(true);
      setTimeout(() => setWalletCopied(false), 2000);
    });
  };

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Overview</h1>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full space-y-8">
        {!stats.hasWallet && (
          <div className="glass-panel p-4 border border-amber-500/30 bg-amber-500/5 text-sm">
            <p className="text-amber-200">
              Your Genesis wallet is set up in{' '}
              <Link href="/dashboard/treasury" className="underline font-medium">
                Treasury
              </Link>{' '}
              to accept payments on links and POS.
            </p>
          </div>
        )}

        {/* Identity verification (KYC) — opens the global KycModal, which runs
            the real backend flow (initKyc → Stripe). Shown in all states so the
            option is always available and clearly organized. */}
        <div
          className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ borderColor: kycVerified ? 'rgba(16,185,129,0.25)' : 'rgba(96,165,250,0.25)' }}
        >
          <div className="flex items-start gap-4">
            <div className={clsx(
              "p-3 rounded-2xl shrink-0",
              kycVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-[#60A5FA]"
            )}>
              {kycVerified ? <CheckCircle2 size={22} /> : <ShieldCheck size={22} />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-light text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {kycVerified ? 'Identity verified' : kycProcessing ? 'Verification in progress' : 'Verify your identity'}
                </h3>
                {kycVerified ? (
                  <span className="text-[10px] uppercase tracking-wider font-body px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                ) : kycProcessing ? (
                  <span className="text-[10px] uppercase tracking-wider font-body px-2 py-0.5 rounded-full bg-blue-500/10 text-[#60A5FA] border border-blue-500/20">
                    In review
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-body px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Action required
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                {kycVerified
                  ? 'You have full access to fiat top-ups, crypto-to-fiat conversions and premium liquidity.'
                  : kycProcessing
                    ? 'We are reviewing your documents. This can take a few minutes — you can keep using the dashboard meanwhile.'
                    : 'Complete KYC to unlock fiat top-ups, crypto-to-fiat conversions and premium liquidity. It takes about 2 minutes.'}
              </p>
            </div>
          </div>

          {kycProcessing ? (
            <span className="shrink-0 flex items-center gap-2 text-xs text-[#60A5FA] font-body">
              <Loader2 size={14} className="animate-spin" /> Reviewing…
            </span>
          ) : !kycVerified ? (
            <button
              type="button"
              onClick={() => setIsKycModalOpen(true)}
              className="shrink-0 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-white text-black font-light text-sm hover:bg-[#2563EB] hover:text-white transition-all"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <ShieldCheck size={16} /> Start verification
            </button>
          ) : null}
        </div>

        {/* Top Section: Balance & Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Total Balance Card (1 Column on Large screens) */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px)',
              borderRadius: '32px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
            }}
            className="p-8 flex flex-col justify-between space-y-6 h-full"
          >
            <div className="space-y-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-body block">Account Balance</span>
              <div className="flex items-center justify-between gap-4 mt-2 w-full flex-wrap">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    className="flex items-center justify-between w-40 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-light hover:bg-white/10 hover:text-white transition-all font-body"
                  >
                    <span>{selectedOption.name}</span>
                    <ChevronDown size={12} className={clsx("transition-transform duration-300", isAccountDropdownOpen && "rotate-180")} />
                  </button>
                  
                  {isAccountDropdownOpen && (
                    <div 
                      style={{
                        background: 'rgba(10, 10, 10, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                      }}
                      className="absolute left-0 mt-2 w-44 z-40 overflow-hidden py-1"
                    >
                      {accountOptions.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setSelectedAccountId(acc.id);
                            setIsAccountDropdownOpen(false);
                          }}
                          className={clsx(
                            "w-full text-left px-4 py-2 text-xs transition-colors",
                            selectedAccountId === acc.id
                              ? "bg-white/10 text-white font-medium"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {acc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-4xl md:text-5xl font-light text-white tracking-tight font-sans">
                  {balanceIsLoading ? (
                    <LoadingVideo className="w-auto h-10" />
                  ) : selectedSol && selectedSol > 0 ? (
                    <>
                      {formatSol(selectedSol)}
                      <span className="text-2xl text-gray-400 ml-2">SOL</span>
                    </>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* Receive: direct QR to the Genesis wallet + address + copy.
                  Tapping the QR still opens advanced options (charge with an
                  amount, scan a QR, request a payment) so nothing is lost. */}
              {merchantWallet ? (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    title="Scan to pay this wallet · tap for charge & scan options"
                    className="bg-white p-3 rounded-2xl shadow-lg hover:opacity-90 transition-opacity"
                  >
                    <QRCodeSVG
                      value={buildOpenAmountQrUrl(merchantWallet, businessName || 'Luxor Pay')}
                      size={132}
                      level="H"
                      includeMargin={false}
                    />
                  </button>
                  <span className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-widest font-body">
                    <QrCode size={12} /> Genesis wallet
                  </span>
                  <div className="flex items-center gap-2 w-full bg-white/5 border border-white/10 rounded-full px-4 py-2">
                    <span className="flex-1 text-xs text-gray-300 font-mono truncate" title={merchantWallet}>
                      {merchantWallet}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyWallet}
                      title={walletCopied ? 'Copied!' : 'Copy address'}
                      aria-label="Copy wallet address"
                      className={clsx(
                        "flex items-center justify-center w-8 h-8 rounded-full border transition-all shrink-0",
                        walletCopied
                          ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                          : "border-white/10 text-white bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {walletCopied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-4 text-gray-500 text-xs">
                  <LoadingVideo className="w-auto h-10" />
                  <span>Generating Genesis wallet…</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsTransferModalOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-black font-light hover:bg-white/90 transition-all font-sans text-xs shadow-md"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <Send size={14} /> Send
                </button>
                <button 
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-black font-light hover:bg-white/90 transition-all font-sans text-xs shadow-md"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <ArrowLeftRight size={14} /> Trade
                </button>
              </div>

              {/* Top up Wallet (fiat on-ramp). Available once KYC is verified,
                  matching the previous WalletBalanceContainer behavior. */}
              {kycVerified && merchantWallet && (
                <FundWalletButton merchantWallet={merchantWallet} />
              )}
            </div>
          </div>

          {/* Chart Card (2 Columns on Large screens) */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(40px)',
              borderRadius: '32px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)',
            }}
            className="p-8 lg:col-span-2 flex flex-col justify-between h-full min-h-[300px]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-body">Account Performance</span>
            </div>
            
            {/* Chart data comes from the backend. While it is unavailable we
                show the loading indicator instead of any generic data. */}
            <div className="relative flex-1 w-full min-h-[180px] mt-2 flex flex-col items-center justify-center gap-3 text-gray-500 text-sm">
              <LoadingVideo className="w-auto h-10" />
              <span>Loading chart data…</span>
            </div>
          </div>
        </div>

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
    <Link href={href} className="glass-panel p-6 hover:bg-white/[0.04] transition-colors block">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={isText ? 'text-xl font-bold text-primary' : 'text-3xl font-bold'}>{value}</p>
    </Link>
  );
}
