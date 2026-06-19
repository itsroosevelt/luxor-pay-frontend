'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGetBalance } from '@/hooks/useGetBalance';
import { getSolanaNetworkLabel } from '@/lib/solana-env';
import { 
  CreditCard, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  ChevronDown, 
  Link2Off,
  Settings2
} from 'lucide-react';
import { toast } from 'sonner';

interface WalletStatusHeaderProps {
  merchantWallet: string | null;
}

const SolanaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 397 311" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M64.6 237.9c-2.4-2.4-5.7-3.8-9.1-3.8H5.1c-4.4 0-7.2 4.7-5.1 8.5L53 328.7c2.4 2.4 5.7 3.8 9.1 3.8h50.4c4.4 0 7.2-4.7 5.1-8.5l-53-86.1z" fill="url(#solana-gradient)" />
    <path d="M332.4 76.1c2.4 2.4 5.7 3.8 9.1 3.8h50.4c4.4 0 7.2-4.7 5.1-8.5l-53-86.1C381.6-17.1 378.3-18.5 374.9-18.5H324.5c-4.4 0-7.2 4.7-5.1 8.5l53 86.1z" fill="url(#solana-gradient)" />
    <path d="M53 76.1C55.4 78.5 58.7 79.9 62.1 79.9h50.4c4.4 0 7.2-4.7 5.1-8.5l-53-86.1C61.8-17.1 58.5-18.5 55.1-18.5H4.7c-4.4 0-7.2 4.7-5.1 8.5l53.4 86.1z" fill="url(#solana-gradient)" />
    <path d="M332.4 237.9c-2.4-2.4-5.7-3.8-9.1-3.8H272.9c-4.4 0-7.2 4.7-5.1 8.5l53 86.1c2.4 2.4 5.7 3.8 9.1 3.8h50.4c4.4 0 7.2-4.7 5.1-8.5l-53-86.1z" fill="url(#solana-gradient)" />
    <defs>
      <linearGradient id="solana-gradient" x1="397" y1="-18.5" x2="0" y2="332.5" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
  </svg>
);

export function WalletStatusHeader({ merchantWallet }: WalletStatusHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [rpc, setRpc] = useState<'helius' | 'triton' | 'custom'>('helius');
  const [disableJito, setDisableJito] = useState(false);
  const [explorer, setExplorer] = useState('solscan');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const networkLabel = getSolanaNetworkLabel();

  // Fetch balance using develop branch hook
  const { data: balanceData } = useGetBalance(merchantWallet);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!merchantWallet) return null;

  const truncateAddress = (addr: string) => {
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(merchantWallet);
    toast.success('Wallet address copied to clipboard');
  };

  const handleOpenExplorer = () => {
    let baseUrl = 'https://solscan.io/account/';
    if (explorer === 'solana') baseUrl = 'https://explorer.solana.com/address/';
    else if (explorer === 'solanafm') baseUrl = 'https://solana.fm/address/';
    
    const clusterSuffix = networkLabel === 'devnet' ? '?cluster=devnet' : '';
    window.open(`${baseUrl}${merchantWallet}${clusterSuffix}`, '_blank');
  };

  const solBalance = balanceData?.solBalance 
    ? parseFloat(balanceData.solBalance).toFixed(4)
    : '0.0000';

  const isLowBalance = parseFloat(solBalance) < 0.05;

  return (
    <div className="relative" ref={containerRef}>
      {/* Horizontal Widget Row */}
      <div className="flex items-center gap-1.5 bg-black/25 border border-white/5 rounded-xl p-1 text-xs">
        {/* Network Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-[var(--dash-muted)] font-medium capitalize">
          <span>Network Status</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Balance Badge */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-colors text-[var(--dash-text)] font-semibold tabular-nums"
        >
          <SolanaIcon />
          <span>{solBalance} SOL</span>
          {isLowBalance && (
            <span title="Low balance">
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
            </span>
          )}
        </div>

        {/* Address Badge */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors text-[var(--dash-text)] font-mono font-medium"
        >
          <CreditCard size={13} className="text-[var(--dash-muted)]" />
          <span>{truncateAddress(merchantWallet)}</span>
          <ChevronDown size={12} className="text-[var(--dash-muted)] ml-0.5" />
        </button>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0F0F11]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-5 text-sm text-[#D1D1D6]">
          {/* Theme Selector */}
          <div className="flex items-center justify-between bg-black/20 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                theme === 'dark' ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--dash-muted)] hover:text-white'
              }`}
            >
              <Moon size={13} />
              <span>Dark</span>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                theme === 'light' ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--dash-muted)] hover:text-white'
              }`}
            >
              <Sun size={13} />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('auto')}
              className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                theme === 'auto' ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--dash-muted)] hover:text-white'
              }`}
            >
              <Monitor size={13} />
              <span>Auto</span>
            </button>
          </div>

          {/* Copy Address Row */}
          <div className="flex items-center gap-2 bg-black/25 border border-white/5 rounded-xl p-2.5">
            <span className="font-mono text-xs text-white/90 flex-1 truncate select-all">{merchantWallet}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--dash-muted)] hover:text-white transition-colors"
              title="Copy Address"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={handleOpenExplorer}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--dash-muted)] hover:text-white transition-colors"
              title="View on Explorer"
            >
              <ExternalLink size={14} />
            </button>
          </div>

          {/* RPC Connection */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[var(--dash-muted)] uppercase tracking-wider">RPC Connection</span>
            <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/5">
              <button
                onClick={() => setRpc('helius')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  rpc === 'helius' ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--dash-muted)] hover:text-white'
                }`}
              >
                Helius
              </button>
              <button
                onClick={() => setRpc('triton')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  rpc === 'triton' ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--dash-muted)] hover:text-white'
                }`}
              >
                Triton
              </button>
              <button
                onClick={() => setRpc('custom')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  rpc === 'custom' ? 'bg-white/10 text-white shadow-sm' : 'text-[var(--dash-muted)] hover:text-white'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* Jito Tips */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="jito-tips"
              checked={disableJito}
              onChange={(e) => setDisableJito(e.target.checked)}
              className="mt-1 rounded border-white/10 bg-black/20 text-[var(--dash-accent)] focus:ring-[var(--dash-accent)]"
            />
            <label htmlFor="jito-tips" className="text-xs space-y-0.5 cursor-pointer">
              <p className="font-semibold text-white/90">Disable Jito tips</p>
              <p className="text-[var(--dash-muted)] leading-relaxed">
                Skips the Jito tip instruction and the Jito block engine for every transaction sent from this browser.
              </p>
            </label>
          </div>

          {/* Explorer Selector */}
          <div className="space-y-2">
            <label htmlFor="explorer-select" className="text-[11px] font-semibold text-[var(--dash-muted)] uppercase tracking-wider">Explorer</label>
            <div className="relative">
              <select
                id="explorer-select"
                value={explorer}
                onChange={(e) => setExplorer(e.target.value)}
                className="w-full bg-black/20 border border-white/5 rounded-xl py-2 px-3.5 text-xs text-white appearance-none focus:outline-none focus:border-white/10 cursor-pointer"
              >
                <option value="solscan" className="bg-[#0F0F11]">Solscan</option>
                <option value="solana" className="bg-[#0F0F11]">Solana Explorer</option>
                <option value="solanafm" className="bg-[#0F0F11]">Solana FM</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--dash-muted)]">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Disconnect button */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/15 text-red-400 text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Link2Off size={14} />
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
