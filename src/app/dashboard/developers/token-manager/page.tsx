'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Coins,
  Plus,
  Copy,
  ExternalLink,
  Flame,
  Send,
  Sparkles,
  Layers,
  ChevronDown,
  Check,
  X,
  Loader2,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TransferModal } from '@/components/dashboard/overview/TransferModal';

interface TokenItem {
  id: string;
  name: string;
  symbol: string;
  mintAddress: string;
  supply: string;
  valueUsd: string;
  decimals: number;
  isCustom?: boolean;
}

const DEFAULT_TOKENS: TokenItem[] = [
  {
    id: 'token-lxr',
    name: 'Luxor',
    symbol: 'LXR',
    mintAddress: '3kxGSxkvuFGu3NJjzuAAXMHjVvpWarXwHQsguxVbiBHE',
    supply: '1,000,000,000',
    valueUsd: '$0.0731',
    decimals: 9,
  },
];

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 32px 40px 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export default function TokenManagerPage() {
  const [tokens, setTokens] = useState<TokenItem[]>(DEFAULT_TOKENS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active Dropdowns
  const [activeActionsId, setActiveActionsId] = useState<string | null>(null);
  const [activeTransferId, setActiveTransferId] = useState<string | null>(null);
  const [activeBurnId, setActiveBurnId] = useState<string | null>(null);

  // Modals state
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(null);

  // Add Token Form state
  const [addForm, setAddForm] = useState({
    name: '',
    symbol: '',
    mintAddress: '',
    supply: '1,000,000',
    decimals: '9',
  });

  // Mint / Burn Form state
  const [actionAmount, setActionAmount] = useState('');
  const [actionRecipient, setActionRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleAddTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.symbol || !addForm.mintAddress) {
      toast.error('Please fill in all required token fields');
      return;
    }

    const newToken: TokenItem = {
      id: `token-${Date.now()}`,
      name: addForm.name.trim(),
      symbol: addForm.symbol.trim().toUpperCase(),
      mintAddress: addForm.mintAddress.trim(),
      supply: Number(addForm.supply.replace(/,/g, '') || '0').toLocaleString('en-US'),
      valueUsd: '$0.00',
      decimals: Number(addForm.decimals) || 9,
      isCustom: true,
    };

    setTokens((prev) => [...prev, newToken]);
    toast.success(`Token ${newToken.symbol} added to Token Manager!`);
    setIsAddTokenOpen(false);
    setAddForm({ name: '', symbol: '', mintAddress: '', supply: '1,000,000', decimals: '9' });
  };

  const handleMintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionAmount || Number(actionAmount) <= 0) {
      toast.error('Enter a valid amount to mint');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (selectedToken) {
        setTokens((prev) =>
          prev.map((t) => {
            if (t.id === selectedToken.id) {
              const currentVal = Number(t.supply.replace(/,/g, ''));
              const addedVal = Number(actionAmount);
              return { ...t, supply: (currentVal + addedVal).toLocaleString('en-US') };
            }
            return t;
          })
        );
        toast.success(`Minted ${Number(actionAmount).toLocaleString()} ${selectedToken.symbol} successfully!`);
      }
      setIsMintModalOpen(false);
      setActionAmount('');
      setActionRecipient('');
    }, 1200);
  };

  const handleBurnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionAmount || Number(actionAmount) <= 0) {
      toast.error('Enter a valid amount to burn');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (selectedToken) {
        setTokens((prev) =>
          prev.map((t) => {
            if (t.id === selectedToken.id) {
              const currentVal = Number(t.supply.replace(/,/g, ''));
              const burnVal = Number(actionAmount);
              const newVal = Math.max(0, currentVal - burnVal);
              return { ...t, supply: newVal.toLocaleString('en-US') };
            }
            return t;
          })
        );
        toast.success(`Burned ${Number(actionAmount).toLocaleString()} ${selectedToken.symbol} on-chain! 🔥`);
      }
      setIsBurnModalOpen(false);
      setActionAmount('');
    }, 1200);
  };

  return (
    <PageContainer>
      {/* Header */}
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            Token Manager
          </h1>
          <p className="lx-page-subtitle">
            Manage deployed SPL tokens, mint additional supply, burn tokens, and execute multi-sig authority actions.
          </p>
        </div>
      </header>

      <ContentLayout>
        {/* Tokens Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-white/60" />
              <h2 className="text-base font-semibold text-white font-['Outfit']">Registered SPL Tokens</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsAddTokenOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs hover:bg-gray-200 transition-colors shrink-0 shadow-lg"
            >
              <Plus size={15} /> Add token
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-xs text-gray-400 font-normal">
                  <th className="pb-3 pt-2 font-['Outfit']">Token</th>
                  <th className="pb-3 pt-2 font-['Outfit']">Supply</th>
                  <th className="pb-3 pt-2 font-['Outfit']">Value</th>
                  <th className="pb-3 pt-2 text-right font-['Outfit']">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {tokens.map((token) => {
                  const truncatedMint = `${token.mintAddress.slice(0, 4)}...${token.mintAddress.slice(-4)}`;

                  return (
                    <tr key={token.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Token Identity */}
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold font-['Outfit'] shrink-0 text-xs">
                            {token.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-['Outfit'] font-semibold text-sm text-white">
                                {token.name}
                              </span>
                              <span className="text-gray-400 font-normal text-xs">{token.symbol}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-mono mt-0.5">
                              <span>{truncatedMint}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(token.mintAddress, token.id)}
                                className="hover:text-white transition-colors"
                                title="Copy Mint Address"
                              >
                                {copiedId === token.id ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                              <a
                                href={`https://solscan.io/token/${token.mintAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                                title="View on Solscan"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Supply */}
                      <td className="py-4 px-4 font-bold text-white font-mono text-sm">
                        {token.supply}
                      </td>

                      {/* Value */}
                      <td className="py-4 px-4 text-gray-300 font-mono text-sm">
                        {token.valueUsd}
                      </td>

                      {/* Action Dropdown Buttons (Actions, Transfer, Burn) */}
                      <td className="py-4 pl-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {/* 1. Actions Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveActionsId(activeActionsId === token.id ? null : token.id);
                                setActiveTransferId(null);
                                setActiveBurnId(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white text-xs font-['Outfit'] font-medium transition-all"
                            >
                              Actions <ChevronDown size={13} className="text-gray-400" />
                            </button>

                            {activeActionsId === token.id && (
                              <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-2xl bg-[#0D0E14] border border-white/15 shadow-2xl p-1.5 space-y-1 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedToken(token);
                                    setActiveActionsId(null);
                                    setIsMintModalOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 transition-colors font-['Outfit']"
                                >
                                  <Sparkles size={14} className="text-blue-400" /> Mint More Supply
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionsId(null);
                                    toast.info(`Freeze authority request generated for ${token.symbol}`);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-300 hover:bg-white/10 transition-colors font-['Outfit']"
                                >
                                  <ShieldCheck size={14} className="text-amber-400" /> Freeze Accounts
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 2. Transfer Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTransferId(activeTransferId === token.id ? null : token.id);
                                setActiveActionsId(null);
                                setActiveBurnId(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white text-xs font-['Outfit'] font-medium transition-all"
                            >
                              Transfer <ChevronDown size={13} className="text-gray-400" />
                            </button>

                            {activeTransferId === token.id && (
                              <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-2xl bg-[#0D0E14] border border-white/15 shadow-2xl p-1.5 space-y-1 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedToken(token);
                                    setActiveTransferId(null);
                                    setIsTransferModalOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white hover:bg-white/10 transition-colors font-['Outfit']"
                                >
                                  <Send size={14} className="text-emerald-400" /> Transfer Tokens
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 3. Burn Dropdown */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveBurnId(activeBurnId === token.id ? null : token.id);
                                setActiveActionsId(null);
                                setActiveTransferId(null);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white text-xs font-['Outfit'] font-medium transition-all"
                            >
                              Burn <ChevronDown size={13} className="text-gray-400" />
                            </button>

                            {activeBurnId === token.id && (
                              <div className="absolute right-0 top-full mt-1.5 z-30 w-48 rounded-2xl bg-[#0D0E14] border border-white/15 shadow-2xl p-1.5 space-y-1 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedToken(token);
                                    setActiveBurnId(null);
                                    setIsBurnModalOpen(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors font-['Outfit']"
                                >
                                  <Flame size={14} /> Burn Tokens
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </ContentLayout>

      {/* ── Modal 1: Add Token ── */}
      {isAddTokenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/15 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-semibold font-['Outfit'] flex items-center gap-2">
                <Coins size={18} className="text-blue-400" /> Register Token
              </h3>
              <button
                type="button"
                onClick={() => setIsAddTokenOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTokenSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">SPL Token Mint Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7Qm6vWdth8K9pX2mL1jF3nB5v8K9..."
                  value={addForm.mintAddress}
                  onChange={(e) => setAddForm((prev) => ({ ...prev, mintAddress: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Token Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxor Pay"
                    value={addForm.name}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Symbol *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LXR"
                    value={addForm.symbol}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, symbol: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Total Supply</label>
                  <input
                    type="text"
                    placeholder="1,000,000"
                    value={addForm.supply}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, supply: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Decimals</label>
                  <input
                    type="number"
                    placeholder="9"
                    value={addForm.decimals}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, decimals: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs hover:bg-gray-200 transition-colors mt-2"
              >
                Add Token
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Mint Tokens ── */}
      {isMintModalOpen && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/15 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-semibold font-['Outfit'] flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" /> Mint {selectedToken.symbol}
              </h3>
              <button
                type="button"
                onClick={() => setIsMintModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleMintSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Recipient Address (Optional)</label>
                <input
                  type="text"
                  placeholder="Defaults to treasury vault address"
                  value={actionRecipient}
                  onChange={(e) => setActionRecipient(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Amount to Mint *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-blue-400 text-base font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Minting Tokens...
                  </>
                ) : (
                  `Mint ${selectedToken.symbol} Tokens`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Burn Tokens ── */}
      {isBurnModalOpen && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/15 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-semibold font-['Outfit'] flex items-center gap-2 text-red-400">
                <Flame size={18} /> Burn {selectedToken.symbol}
              </h3>
              <button
                type="button"
                onClick={() => setIsBurnModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBurnSubmit} className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-800/40 text-red-300 text-[11px] leading-relaxed">
                Warning: Burning tokens permanently destroys them from circulating supply. This action cannot be undone.
              </div>

              <div className="space-y-1">
                <label className="text-gray-400 block font-['Outfit'] text-xs font-medium">Amount to Burn *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-red-400 text-base font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-red-500 text-white font-['Outfit'] font-semibold text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Burning Tokens...
                  </>
                ) : (
                  `Burn ${selectedToken.symbol}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 4: Transfer Tokens ── */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        initialMint={selectedToken?.mintAddress}
      />
    </PageContainer>
  );
}
