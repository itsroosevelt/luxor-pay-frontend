'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchants-api';
import { listPaymentLinks, listPosDevices } from '@/lib/payments-api';
import { listPaymentRequests } from '@/lib/payment-requests-api';
import { getLuxorEnv } from '@/lib/luxor-env';
import { Link as LinkIcon, Terminal, Code2, ArrowRight, Send, QrCode, Bell, ArrowLeftRight, Calendar, ZoomIn, X, ChevronDown } from 'lucide-react';
import { WalletBalanceContainer } from '@/components/dashboard/WalletBalanceContainer';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';
import { TransferSuccessModal } from '@/components/dashboard/overview/TransferSuccessModal';
import { PaymentRequestModal } from '@/components/dashboard/overview/PaymentRequestModal';
import { Transfer } from '@/lib/transfers-api';
import { QrOperationsModal } from '@/components/dashboard/overview/QrOperationsModal';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';
import { clsx } from 'clsx';

const timeframeData = {
  '1D': {
    path: "M 0 100 Q 73 95 73 95 T 146 120 T 219 80 T 292 90 T 365 50 T 440 60",
    areaPath: "M 0 100 Q 73 95 73 95 T 146 120 T 219 80 T 292 90 T 365 50 T 440 60 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 60 },
    dates: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    change: '+0.25% (1d)'
  },
  '5D': {
    path: "M 0 120 Q 73 140 73 140 T 146 100 T 219 90 T 292 110 T 365 70 T 440 50",
    areaPath: "M 0 120 Q 73 140 73 140 T 146 100 T 219 90 T 292 110 T 365 70 T 440 50 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 50 },
    dates: ['Jul 7', 'Jul 8', 'Jul 9', 'Jul 10', 'Jul 11', '', ''],
    change: '+1.80% (5d)'
  },
  '1M': {
    path: "M 0 160 Q 73 145 73 145 T 146 110 T 219 120 T 292 65 T 365 70 T 440 30",
    areaPath: "M 0 160 Q 73 145 73 145 T 146 110 T 219 120 T 292 65 T 365 70 T 440 30 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 30 },
    dates: ['Jul 5', 'Jul 6', 'Jul 7', 'Jul 8', 'Jul 9', 'Jul 10', 'Jul 11'],
    change: '+4.15% (7d)'
  },
  '3M': {
    path: "M 0 140 Q 73 120 73 120 T 146 130 T 219 80 T 292 95 T 365 40 T 440 20",
    areaPath: "M 0 140 Q 73 120 73 120 T 146 130 T 219 80 T 292 95 T 365 40 T 440 20 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 20 },
    dates: ['May', 'Jun', 'Jul', '', '', '', ''],
    change: '+12.40% (3m)'
  },
  '6M': {
    path: "M 0 150 Q 73 130 73 130 T 146 90 T 219 110 T 292 70 T 365 50 T 440 15",
    areaPath: "M 0 150 Q 73 130 73 130 T 146 90 T 219 110 T 292 70 T 365 50 T 440 15 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 15 },
    dates: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', ''],
    change: '+24.15% (6m)'
  },
  'YTD': {
    path: "M 0 160 Q 73 140 73 140 T 146 110 T 219 100 T 292 80 T 365 60 T 440 25",
    areaPath: "M 0 160 Q 73 140 73 140 T 146 110 T 219 100 T 292 80 T 365 60 T 440 25 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 25 },
    dates: ['Jan', 'Mar', 'May', 'Jul', '', '', ''],
    change: '+35.60% (YTD)'
  },
  '1Y': {
    path: "M 0 170 Q 73 150 73 150 T 146 120 T 219 90 T 292 60 T 365 40 T 440 10",
    areaPath: "M 0 170 Q 73 150 73 150 T 146 120 T 219 90 T 292 60 T 365 40 T 440 10 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 10 },
    dates: ['Q3 25', 'Q4 25', 'Q1 26', 'Q2 26', '', '', ''],
    change: '+120.40% (1y)'
  },
  '5Y': {
    path: "M 0 180 Q 73 160 73 160 T 146 140 T 219 110 T 292 80 T 365 50 T 440 5",
    areaPath: "M 0 180 Q 73 160 73 160 T 146 140 T 219 110 T 292 80 T 365 50 T 440 5 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 5 },
    dates: ['2022', '2023', '2024', '2025', '2026', '', ''],
    change: '+450.15% (5y)'
  },
  'All': {
    path: "M 0 190 Q 73 175 73 175 T 146 150 T 219 120 T 292 90 T 365 40 T 440 2",
    areaPath: "M 0 190 Q 73 175 73 175 T 146 150 T 219 120 T 292 90 T 365 40 T 440 2 L 440 170 L 0 170 Z",
    lastPoint: { cx: 440, cy: 2 },
    dates: ['All time', '', '', '', '', '', ''],
    change: '+890.75%'
  }
};

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({ links: 0, pos: 0, hasWallet: false });
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<keyof typeof timeframeData>('1M');
  const [isChartZoomed, setIsChartZoomed] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('Total');
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isPaymentRequestModalOpen, setIsPaymentRequestModalOpen] = useState(false);
  const [pendingInboxCount, setPendingInboxCount] = useState(0);

  const [isTransferSuccessModalOpen, setIsTransferSuccessModalOpen] = useState(false);
  const [transferSuccessData, setTransferSuccessData] = useState<Transfer | null>(null);

  const currentChart = timeframeData[selectedTimeframe];

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
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Overview</h1>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full space-y-8">
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
                    <span>{selectedAccount}</span>
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
                      {['Total', 'Business Wallet', 'Savings Wallet', 'Treasury'].map((acc) => (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => {
                            setSelectedAccount(acc);
                            setIsAccountDropdownOpen(false);
                          }}
                          className={clsx(
                            "w-full text-left px-4 py-2 text-xs transition-colors",
                            selectedAccount === acc
                              ? "bg-white/10 text-white font-medium"
                              : "text-gray-400 hover:text-white hover:bg-white/5"
                          )}
                        >
                          {acc}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-4xl md:text-5xl font-light text-white tracking-tight font-sans">
                  {selectedAccount === 'Total' ? '$75.59' : 
                   selectedAccount === 'Business Wallet' ? '$45.20' : 
                   selectedAccount === 'Savings Wallet' ? '$20.39' : '$10.00'}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsQrModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-blue-500/30 bg-[#2563EB]/5 text-[#60A5FA] font-light hover:bg-[#2563EB]/15 transition-all font-sans text-sm"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <QrCode size={16} /> Receive
              </button>
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
              <span className="text-xs text-emerald-400 font-light font-sans">{currentChart.change}</span>
            </div>
            
            {/* SVG Line Chart */}
            <div className="relative flex-1 w-full min-h-[180px] mt-2">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                <defs>
                  {/* Line Gradient */}
                  <linearGradient id="chart-line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                  {/* Fill Area Gradient */}
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="0" y1="30" x2="440" y2="30" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <line x1="0" y1="70" x2="440" y2="70" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <line x1="0" y1="110" x2="440" y2="110" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <line x1="0" y1="150" x2="440" y2="150" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />

                {/* Y Axis Gridline on the right side */}
                <line x1="440" y1="10" x2="440" y2="170" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                {/* X Axis Gridline at bottom */}
                <line x1="0" y1="170" x2="440" y2="170" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                {/* Area under the line */}
                <path
                  d={currentChart.areaPath}
                  fill="url(#chart-area-grad)"
                  style={{ transition: 'd 0.5s ease-in-out' }}
                />

                {/* The Trend Line */}
                <path
                  d={currentChart.path}
                  fill="none"
                  stroke="url(#chart-line-grad)"
                  strokeWidth="2"
                  style={{ transition: 'd 0.5s ease-in-out' }}
                />

                {/* Last point glow/dot */}
                <circle 
                  cx={currentChart.lastPoint.cx} 
                  cy={currentChart.lastPoint.cy} 
                  r="4" 
                  fill="#60A5FA" 
                  style={{ transition: 'cx 0.5s ease-in-out, cy 0.5s ease-in-out' }}
                />
                <circle 
                  cx={currentChart.lastPoint.cx} 
                  cy={currentChart.lastPoint.cy} 
                  r="8" 
                  fill="#60A5FA" 
                  fillOpacity="0.3" 
                  className="animate-ping" 
                  style={{ transition: 'cx 0.5s ease-in-out, cy 0.5s ease-in-out' }}
                />

                {/* Y-Axis Labels (Right Side) */}
                <text x="450" y="34" fill="rgba(255, 255, 255, 0.4)" fontSize="9" className="font-mono">$77.00</text>
                <text x="450" y="62" fill="rgba(255, 255, 255, 0.4)" fontSize="9" className="font-mono">$76.00</text>
                <text x="450" y="90" fill="rgba(255, 255, 255, 0.4)" fontSize="9" className="font-mono">$75.00</text>
                <text x="450" y="118" fill="rgba(255, 255, 255, 0.4)" fontSize="9" className="font-mono">$74.00</text>
                <text x="450" y="146" fill="rgba(255, 255, 255, 0.4)" fontSize="9" className="font-mono">$73.00</text>
                <text x="450" y="174" fill="rgba(255, 255, 255, 0.4)" fontSize="9" className="font-mono">$72.00</text>
              </svg>
            </div>

            {/* X-Axis Labels (Dates) */}
            <div className="flex justify-between pr-[60px] pt-2 text-[10px] text-gray-500 font-mono">
              {currentChart.dates.map((date, idx) => (
                <span key={idx} className="min-w-[40px] text-center">{date}</span>
              ))}
            </div>

            {/* Timeframe Selector & Timezone Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
              {/* Left: Timeframe tabs */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto">
                {(['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2.5 py-1 text-[11px] rounded-md transition-all font-mono ${
                      selectedTimeframe === tf
                        ? 'bg-white/10 text-white'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
                <div className="w-[1px] h-4 bg-white/10 mx-1 flex-shrink-0" />
                <button
                  type="button"
                  className="p-1 text-gray-500 hover:text-white rounded transition-colors flex-shrink-0"
                  title="Select custom date range"
                >
                  <Calendar size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsChartZoomed(true)}
                  className="p-1 text-gray-500 hover:text-white rounded transition-colors flex-shrink-0 ml-1"
                  title="Zoom chart"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Right: Timezone display */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-mono self-end sm:self-auto">
                <span>11:39:18</span>
                <span className="text-[#60A5FA]">UTC-6</span>
              </div>
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
        initialMode="select"
        onCreatePaymentRequest={() => setIsPaymentRequestModalOpen(true)}
      />

      {/* Zoom Chart Modal */}
      {isChartZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            style={{
              background: 'rgba(10, 10, 10, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(40px)',
              borderRadius: '32px',
              boxShadow: '0 32px 64px -16px rgba(0,0,0,0.8)',
            }}
            className="w-full max-w-4xl p-8 space-y-6 relative flex flex-col"
          >
            <button
              type="button"
              onClick={() => setIsChartZoomed(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex items-center justify-between pr-8">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-body">Account Performance (Detailed)</span>
                <h2 className="text-2xl font-light text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {selectedTimeframe} Overview
                </h2>
              </div>
              <span className="text-sm text-emerald-400 font-light font-sans">{currentChart.change}</span>
            </div>

            {/* Enlarged SVG Line Chart */}
            <div className="relative flex-1 w-full min-h-[300px] mt-4">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="30" x2="440" y2="30" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <line x1="0" y1="70" x2="440" y2="70" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <line x1="0" y1="110" x2="440" y2="110" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                <line x1="0" y1="150" x2="440" y2="150" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                {/* Y Axis Gridline on the right side */}
                <line x1="440" y1="10" x2="440" y2="170" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

                {/* X Axis Gridline at bottom */}
                <line x1="0" y1="170" x2="440" y2="170" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

                {/* Area under the line */}
                <path
                  d={currentChart.areaPath}
                  fill="url(#chart-area-grad)"
                  style={{ transition: 'd 0.5s ease-in-out' }}
                />

                {/* The Trend Line */}
                <path
                  d={currentChart.path}
                  fill="none"
                  stroke="url(#chart-line-grad)"
                  strokeWidth="2.5"
                  style={{ transition: 'd 0.5s ease-in-out' }}
                />

                {/* Last point glow/dot */}
                <circle 
                  cx={currentChart.lastPoint.cx} 
                  cy={currentChart.lastPoint.cy} 
                  r="5" 
                  fill="#60A5FA" 
                  style={{ transition: 'cx 0.5s ease-in-out, cy 0.5s ease-in-out' }}
                />
                <circle 
                  cx={currentChart.lastPoint.cx} 
                  cy={currentChart.lastPoint.cy} 
                  r="10" 
                  fill="#60A5FA" 
                  fillOpacity="0.3" 
                  className="animate-ping" 
                  style={{ transition: 'cx 0.5s ease-in-out, cy 0.5s ease-in-out' }}
                />

                {/* Y-Axis Labels (Right Side) */}
                <text x="450" y="34" fill="rgba(255, 255, 255, 0.6)" fontSize="9" className="font-mono">$77.00</text>
                <text x="450" y="62" fill="rgba(255, 255, 255, 0.6)" fontSize="9" className="font-mono">$76.00</text>
                <text x="450" y="90" fill="rgba(255, 255, 255, 0.6)" fontSize="9" className="font-mono">$75.00</text>
                <text x="450" y="118" fill="rgba(255, 255, 255, 0.6)" fontSize="9" className="font-mono">$74.00</text>
                <text x="450" y="146" fill="rgba(255, 255, 255, 0.6)" fontSize="9" className="font-mono">$73.00</text>
                <text x="450" y="174" fill="rgba(255, 255, 255, 0.6)" fontSize="9" className="font-mono">$72.00</text>
              </svg>
            </div>

            {/* X-Axis Labels (Dates) */}
            <div className="flex justify-between pr-[60px] pt-2 text-xs text-gray-400 font-mono">
              {currentChart.dates.map((date, idx) => (
                <span key={idx} className="min-w-[40px] text-center">{date}</span>
              ))}
            </div>

            {/* Footer timezone display */}
            <div className="flex items-center justify-between text-xs text-gray-500 font-mono pt-4 border-t border-white/5">
              <span>Timeframe: {selectedTimeframe}</span>
              <div className="flex items-center gap-1">
                <span>11:39:18</span>
                <span className="text-[#60A5FA]">UTC-6</span>
              </div>
            </div>
          </div>
        </div>
      )}
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
