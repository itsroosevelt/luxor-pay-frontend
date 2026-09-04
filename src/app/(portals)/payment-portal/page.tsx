'use client';

import React, { useState } from 'react';
import { Link as LinkIcon, Plus, CheckCircle2, Copy, DollarSign } from 'lucide-react';

export default function PaymentLinksPage() {
  const [linkName, setLinkName] = useState('');
  const [linkAmount, setLinkAmount] = useState('');
  const [linkCurrency, setLinkCurrency] = useState('USDC');
  const [creatingLink, setCreatingLink] = useState(false);
  const [linkCreated, setLinkCreated] = useState<string | null>(null);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingLink(true);
    setTimeout(() => {
      setCreatingLink(false);
      setLinkCreated(`https://pay.luxorpay.io/l/${Math.random().toString(36).slice(2, 8)}`);
      setLinkName('');
      setLinkAmount('');
    }, 1200);
  };

  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">Payment Links</h1>
        <p className="lx-page-subtitle">Create reusable fixed-amount payment links.</p>
      </header>

      <div className="w-full max-w-[640px] p-6 md:p-8 space-y-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <LinkIcon size={18} className="text-white/60" />
            <h2 className="text-[16px] font-medium text-white">Create Payment Link</h2>
          </div>

          <form onSubmit={handleCreateLink} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-white/60">Name / Label</span>
              <input
                type="text"
                required
                placeholder="e.g. Monthly subscription"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-white/60">Amount</span>
                <div className="relative mt-1.5">
                  <DollarSign size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="25.00"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                    className="w-full rounded-full py-2.5 pl-9 pr-4 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-white/60">Currency</span>
                <select
                  value={linkCurrency}
                  onChange={(e) => setLinkCurrency(e.target.value)}
                  className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors"
                >
                  <option value="USDC" className="bg-black text-white">USDC</option>
                  <option value="SOL" className="bg-black text-white">SOL</option>
                  <option value="EURC" className="bg-black text-white">EURC</option>
                </select>
              </label>
            </div>

            <button type="submit" disabled={creatingLink} className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors inline-flex items-center justify-center gap-1.5">
              {creatingLink ? 'Creating link…' : <><Plus size={16} /> Create Payment Link</>}
            </button>
          </form>

          {linkCreated && (
            <div className="flex items-center justify-between gap-3 rounded-full px-4 py-2.5 bg-white/5 border border-white/15">
              <div className="flex min-w-0 items-center gap-2">
                <CheckCircle2 size={16} className="flex-shrink-0 text-white" />
                <span className="truncate font-mono text-xs text-white">{linkCreated}</span>
              </div>
              <button type="button" onClick={() => navigator.clipboard.writeText(linkCreated)} title="Copy" className="text-white hover:text-white/80">
                <Copy size={15} />
              </button>
            </div>
          )}

          <p className="text-xs leading-relaxed text-white/40 border-t border-white/10 pt-4">
            Each Payment Link points directly to your merchant vault. The buyer scans the QR or opens the link, signs with their
            wallet, and the transaction settles instantly on Solana.
          </p>
        </div>
      </div>
    </>
  );
}
