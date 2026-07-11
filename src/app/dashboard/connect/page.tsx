'use client';

import { CreditCard, Plus, ArrowUpRight, ShieldCheck, Wallet } from 'lucide-react';

export default function ConnectPage() {
  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01]">
        <h1 className="text-2xl font-light mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Connect</h1>
        <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Manage your connected accounts, cards, and wallets.
        </p>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 font-body font-light">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Virtual Cards */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px'
            }}
            className="p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                <CreditCard size={24} />
              </div>
              <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 text-xs hover:bg-white/5 transition-all">
                <Plus size={14} /> Add Card
              </button>
            </div>
            <div>
              <h3 className="text-lg font-light text-white mb-1">Luxor Card</h3>
              <p className="text-xs text-gray-500">No active physical or virtual cards.</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={14} /> Secured by PCI-DSS
              </span>
              <span className="hover:text-white cursor-pointer flex items-center gap-0.5">
                Learn more <ArrowUpRight size={12} />
              </span>
            </div>
          </div>

          {/* Card 2: Solana Wallet */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px'
            }}
            className="p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                <Wallet size={24} />
              </div>
              <span className="text-[10px] tracking-wider uppercase font-medium bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full">
                Active
              </span>
            </div>
            <div>
              <h3 className="text-lg font-light text-white mb-1">Solana Wallet</h3>
              <p className="text-xs text-gray-500">Connected to your dashboard workspace.</p>
            </div>
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-purple-400">
                Solana Pay enabled
              </span>
              <span className="hover:text-white cursor-pointer flex items-center gap-0.5">
                Network settings <ArrowUpRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
