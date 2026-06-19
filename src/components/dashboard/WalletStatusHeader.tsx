'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useGetBalance } from '@/hooks/useGetBalance';
import { Copy, ExternalLink, ChevronDown, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface WalletStatusHeaderProps {
  merchantWallet?: string | null;
}

export function WalletStatusHeader({ merchantWallet }: WalletStatusHeaderProps) {
  const { publicKey, connected, disconnect, select, wallets } = useWallet();
  const { setVisible } = useWalletModal();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine active address
  const activeAddress = publicKey
    ? publicKey.toBase58()
    : (merchantWallet && merchantWallet !== 'FqM87UkhE3xQ6YF6z96N9C1b5g2ZkC5z96N9C1b5g2Zk'
        ? merchantWallet
        : null);

  // Fetch balance (falls back to mock address if no active address connected)
  const { data: balanceData } = useGetBalance(activeAddress || 'FqM87UkhE3xQ6YF6z96N9C1b5g2ZkC5z96N9C1b5g2Zk');

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const truncateAddress = (addr: string) => {
    if (addr.length <= 8) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const handleCopyText = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  const handleConnect = async () => {
    try {
      const phantomWallet = wallets.find((w) => w.adapter.name.toLowerCase().includes('phantom'));
      if (phantomWallet) {
        await select(phantomWallet.adapter.name);
      } else {
        setVisible(true);
      }
    } catch (err) {
      console.error(err);
      setVisible(true);
    }
  };

  // Find LUXOR token balance or use a realistic mock balance for demo
  const luxorToken = balanceData?.tokens?.find(
    (t) => t.mint === '7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth'
  );

  const luxorBalance = luxorToken
    ? parseFloat(luxorToken.uiAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '24,500.00';

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Three items in the row: Token icon & balance (left), Phantom address/button (right) */}
      <div className="flex items-center gap-3">
        {/* Token Group: Icon & Balance */}
        <div className="flex items-center gap-2">
          {/* 1. Luxor Token Icon in a small circular container */}
          <div className="w-6 h-6 rounded-full border border-white/15 overflow-hidden bg-black/40 flex items-center justify-center shrink-0 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
            <img 
              src="/luxor-token.png" 
              alt="LUXOR Token" 
              className="w-full h-full object-cover scale-[1.05]"
            />
          </div>

          {/* 2. LXR Balance Text */}
          <span className="text-sm font-semibold text-white/95 tracking-wide select-all whitespace-nowrap">
            {luxorBalance} LXR
          </span>
        </div>

        {/* 3. Connection Button / Wallet Address */}
        {connected && activeAddress ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all text-xs text-white font-mono font-medium hover:scale-[1.01]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            <span>{truncateAddress(activeAddress)}</span>
            <ChevronDown size={12} className="opacity-60 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/10 hover:border-white/20 text-xs font-semibold text-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <img 
              src="https://phantom.app/img/phantom-logo.svg" 
              alt="Phantom" 
              className="w-3.5 h-3.5 opacity-80" 
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span>Conectar Phantom</span>
          </button>
        )}
      </div>

      {/* Redesigned Dropdown Panel */}
      {isOpen && activeAddress && (
        <div className="absolute right-0 top-full mt-2.5 w-80 bg-[#0F0F12]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl z-50 space-y-4 text-xs text-[#D1D1D6]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-semibold text-white text-sm">Detalles de Billetera</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Conectado
            </span>
          </div>

          {/* Wallet Address */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Dirección</span>
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 font-mono">
              <span className="text-white/95 flex-1 truncate select-all">{activeAddress}</span>
              <button
                type="button"
                onClick={() => handleCopyText(activeAddress, 'Dirección de wallet')}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Copiar dirección"
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          {/* Token Contract */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Contrato del Token LUXOR</span>
            <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl p-2.5 font-mono">
              <span className="text-white/80 flex-1 truncate select-all">7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth</span>
              <button
                type="button"
                onClick={() => handleCopyText('7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth', 'Contrato del token')}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Copiar contrato"
              >
                <Copy size={13} />
              </button>
              <a
                href="https://solscan.io/token/7Qm6qUCXGZfGBYYFzq2kTbwTDah5r3d9DcPJHRT8Wdth"
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Ver en Solscan"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Disconnect Button */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                void disconnect();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/15 text-red-400 text-xs font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <LogOut size={13} />
              Desconectar Billetera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
