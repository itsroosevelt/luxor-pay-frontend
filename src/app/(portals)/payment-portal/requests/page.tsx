'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile } from '@/features/merchant/api/merchants-api';
import { PaymentRequestModal } from '@/features/payment-requests/components/PaymentRequestModal';
import { getLuxorEnv } from '@/lib/luxor-env';
import { Search, SlidersHorizontal, Inbox, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { RequestsPanel, type StatusFilter } from '@/features/payment-requests/components/RequestsPanel';

// ─── Page ─────────────────────────────────────────────────────────────────────

type TabId = 'inbox' | 'sent';

export default function PortalPaymentRequestsPage() {
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const network = getLuxorEnv() === 'development' ? 'devnet' : 'mainnet-beta';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user) return;
      try {
        const profile = await getMerchantProfile();
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

  const handleExportCsv = () => {
    toast.success('Exporting payment requests CSV...');
  };

  return (
    <>
      {/* Global shimmer + spin keyframes */}
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>

      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Payment Requests
          </h1>
          <p className="lx-page-subtitle">
            Track payments you&apos;ve requested and payments others are asking from you.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-[1600px] mx-auto space-y-6">

        {/* Top Control Toolbar */}
        <div className="space-y-3 pb-4 border-b border-white/10">
          {/* Row 1: Tab Bar (Inbox / Sent) + Create Request Button */}
          <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Tab Bar (Inbox / Sent) */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-full w-fit shrink-0">
              {tabs.map(({ id, label, Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-black shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Create Request Action Button (Positioned next to Inbox/Sent tabs on Row 1) */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white text-black font-bold hover:bg-gray-200 text-xs transition-all shadow-md shrink-0 ml-auto"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <Send size={14} /> Create Request
            </button>
          </div>

          {/* Row 2: Integrated Search Bar Pill */}
          <div className="relative flex items-center w-full">
            <Search size={14} className="absolute left-3.5 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={statusFilter === 'ALL' ? "Search invoice # or memo..." : `Filter: ${statusFilter} · Search...`}
              className="w-full bg-white/5 border border-white/12 focus:border-white/30 rounded-full py-2 pl-9 pr-24 text-xs text-white placeholder-white/40 outline-none transition-all box-border font-mono"
            />

            {/* Integrated Filter Button & Active Status Badge */}
            <div className="absolute right-2.5 flex items-center gap-1.5 font-mono">
              {statusFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white flex items-center gap-1 transition-colors"
                  title="Clear filter"
                >
                  <span>{statusFilter}</span>
                  <X size={10} />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const filterOptions: ('ALL' | 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED')[] = [
                    'ALL',
                    'PENDING',
                    'PAID',
                    'EXPIRED',
                    'CANCELLED',
                  ];
                  const nextIdx = (filterOptions.indexOf(statusFilter) + 1) % filterOptions.length;
                  const nextFilter = filterOptions[nextIdx];
                  setStatusFilter(nextFilter);
                  toast.info(`Filter: ${nextFilter}`);
                }}
                className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                  statusFilter !== 'ALL' ? 'text-white bg-white/20' : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
                title={`Filter status (Current: ${statusFilter})`}
              >
                <SlidersHorizontal size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Panel Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'inbox' && (
              <RequestsPanel
                perspective="payer"
                walletAddress={merchantWallet}
                network={network}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />
            )}
            {activeTab === 'sent' && (
              <RequestsPanel
                perspective="requester"
                walletAddress={merchantWallet}
                network={network}
                statusFilter={statusFilter}
                searchQuery={searchQuery}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <PaymentRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        requesterWallet={merchantWallet}
      />
    </>
  );
}
