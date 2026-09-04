'use client';

import React, { useState } from 'react';
import { QrCode, Plus, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PosTerminalPage() {
  const [terminalName, setTerminalName] = useState('');
  const [currency, setCurrency] = useState('USDC');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setTimeout(() => {
      setIsRegistering(false);
      setRegisteredSuccess(true);
      setTerminalName('');
    }, 1200);
  };

  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">POS Terminals &amp; Checkout Devices</h1>
        <p className="lx-page-subtitle">
          Manage your physical and virtual point-of-sale devices for in-person QR payments on Solana.
        </p>
      </header>

      <div className="w-full max-w-[900px] p-6 md:p-10 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-white/60" />
            <h2 className="text-[16px] font-medium text-white">Register Device</h2>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-4 items-end">
            <label className="block">
              <span className="text-xs font-medium text-white/60">Device / Till Name</span>
              <input
                type="text"
                required
                placeholder="e.g. Main Till - Downtown Store"
                value={terminalName}
                onChange={(e) => setTerminalName(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-white/60">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors"
              >
                <option value="USDC" className="bg-black text-white">USDC</option>
                <option value="SOL" className="bg-black text-white">SOL</option>
                <option value="EURC" className="bg-black text-white">EURC</option>
              </select>
            </label>

            <button type="submit" disabled={isRegistering} className="lx-btn lx-btn-primary">
              {isRegistering ? 'Linking…' : <><Plus size={15} /> Link Device</>}
            </button>
          </form>

          {registeredSuccess && (
            <p className="flex items-center gap-2 text-sm text-white">
              <CheckCircle2 size={16} /> Terminal paired successfully and ready for in-person payments.
            </p>
          )}

          <div className="pt-6 border-t border-white/10">
            <p className="lx-eyebrow mb-4">Linked Devices</p>
            <div className="flex items-center gap-3 py-3 border-b border-white/5">
              <Smartphone size={16} className="text-white/60 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">POS Terminal #01</p>
                <p className="text-xs text-white/50">Instant checkout with instant vault settlement.</p>
              </div>
              <span className="lx-status flex-shrink-0">Online</span>
            </div>
            <Link
              href="/dashboard/settings?tab=pos"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 hover:text-white transition-colors mt-4"
            >
              Advanced POS device settings <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
