'use client';

import React, { useState } from 'react';
import { Droplets, Plus } from 'lucide-react';

const fieldStyle: React.CSSProperties = {
  background: 'var(--lx-surface-2)', border: '1px solid var(--lx-border)', color: 'var(--lx-text)',
};

export default function LiquidityPage() {
  const [baseToken, setBaseToken] = useState('LXR');
  const [quoteToken, setQuoteToken] = useState('SOL');
  const [baseAmount, setBaseAmount] = useState('100000');
  const [quoteAmount, setQuoteAmount] = useState('50');

  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">DEX Liquidity</h1>
        <p className="lx-page-subtitle">Create a liquidity pool with any SPL/SOL or SPL/USDC pair to enable decentralized trading.</p>
      </header>

      <div className="w-full max-w-[720px] p-6 md:p-8 space-y-6">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-white/60" />
            <h2 className="text-[16px] font-medium text-white">Provide Liquidity on Raydium &amp; Meteora</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-white/60">Base Token</span>
              <input type="text" value={baseToken} onChange={(e) => setBaseToken(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/60">Base Amount</span>
              <input type="number" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/60">Quote Asset</span>
              <select value={quoteToken} onChange={(e) => setQuoteToken(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors">
                <option value="SOL" className="bg-black text-white">SOL</option>
                <option value="USDC" className="bg-black text-white">USDC</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/60">{quoteToken} Amount</span>
              <input type="number" value={quoteAmount} onChange={(e) => setQuoteAmount(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
            </label>
          </div>

          <dl className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <dt className="text-white/40">Initial Price:</dt>
              <dd className="font-medium text-white">1 {baseToken} = {(Number(quoteAmount) / (Number(baseAmount) || 1)).toFixed(6)} {quoteToken}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="text-white/40">DEX Venue:</dt>
              <dd className="font-medium text-white/60">Raydium AMM V4</dd>
            </div>
          </dl>

          <button type="button" className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors inline-flex items-center justify-center gap-1.5">
            <Plus size={16} /> Create Liquidity Pool
          </button>
        </div>
      </div>
    </>
  );
}
