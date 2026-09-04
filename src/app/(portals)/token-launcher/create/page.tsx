'use client';

import React, { useState } from 'react';
import { Rocket, ShieldCheck, Zap, CheckCircle2, Coins } from 'lucide-react';

const fieldStyle: React.CSSProperties = {
  background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)', color: 'var(--lx-text)',
};

export default function CreateTokenPage() {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [totalSupply, setTotalSupply] = useState('1000000000');
  const [description, setDescription] = useState('');
  const [revokeMint, setRevokeMint] = useState(true);
  const [revokeFreeze, setRevokeFreeze] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState(false);

  const handleDeployToken = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeployedSuccess(true);
    }, 1500);
  };

  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">Create Token</h1>
        <p className="lx-page-subtitle">Deploy a new SPL token on Solana with configurable authority policies.</p>
      </header>
      <div className="w-full max-w-[1100px] p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Coins size={18} className="text-white/60" />
                <h2 className="text-[16px] font-medium text-white">Create New SPL Token</h2>
              </div>

              <form onSubmit={handleDeployToken} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-white/60">Token Name</span>
                    <input type="text" required placeholder="e.g. Luxor Ecosystem Token" value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-white/60">Symbol (Ticker)</span>
                    <input type="text" required placeholder="e.g. LXR" value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm uppercase outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-white/60">Total Supply</span>
                    <input type="number" required value={totalSupply} onChange={(e) => setTotalSupply(e.target.value)}
                      className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-white/60">Decimals</span>
                    <select value={decimals} onChange={(e) => setDecimals(Number(e.target.value))}
                      className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors">
                      <option value={9} className="bg-black text-white">9 (Standard)</option>
                      <option value={6} className="bg-black text-white">6 (Fintech / Stable)</option>
                    </select>
                  </label>
                </div>

                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                    <input type="checkbox" checked={revokeMint} onChange={(e) => setRevokeMint(e.target.checked)} className="rounded accent-white" />
                    Revoke Mint Authority
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                    <input type="checkbox" checked={revokeFreeze} onChange={(e) => setRevokeFreeze(e.target.checked)} className="rounded accent-white" />
                    Revoke Freeze Authority
                  </label>
                </div>

                <button type="submit" disabled={isDeploying} className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors">
                  {isDeploying ? 'Deploying to Solana…' : <><Rocket size={15} /> Deploy Token</>}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-4 pt-2">
              <h3 className="lx-eyebrow">Asset Preview</h3>
              <dl className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-white/50">Token</dt>
                  <dd className="font-medium text-white">{tokenName || 'Token Name'} ({tokenSymbol || 'TICKER'})</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-white/50">Supply</dt>
                  <dd className="font-medium text-white">{Number(totalSupply || 0).toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-white/50">Security</dt>
                  <dd className="flex gap-1.5">
                    {revokeMint && <span className="lx-status">Mint Revoked</span>}
                    {revokeFreeze && <span className="lx-status">Freeze Revoked</span>}
                  </dd>
                </div>
              </dl>

              <p className="flex gap-1.5 pt-3 text-xs leading-relaxed text-white/50 border-t border-white/10">
                <Zap size={13} className="mt-0.5 flex-shrink-0 text-white/60" />
                Once your SPL token is deployed, you can launch its liquidity pool under &ldquo;DEX Liquidity&rdquo; in the menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
