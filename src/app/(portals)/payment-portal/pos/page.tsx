'use client';

import React, { useState } from 'react';
import { QrCode, Plus, Smartphone, CheckCircle2 } from 'lucide-react';

const LINKED_DEVICES = [
  { name: 'POS Terminal #01', note: 'Instant checkout with instant vault settlement.', online: true },
];

export default function PortalPosTerminalsPage() {
  const [terminalName, setTerminalName] = useState('');
  const [posCurrency, setPosCurrency] = useState('USDC');
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      setRegistered(true);
      setTerminalName('');
    }, 1200);
  };

  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">POS Terminals</h1>
        <p className="lx-page-subtitle">Manage your physical and virtual point-of-sale terminals.</p>
      </header>

      <div className="mx-auto w-full max-w-[900px] p-6 md:p-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-neutral-400" />
            <h2 className="text-[15px] font-semibold text-white">Register Device</h2>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-[1fr_200px_auto] gap-3 items-end">
            <label className="block">
              <span className="text-xs font-medium text-neutral-400">Device / Till Name</span>
              <input
                type="text"
                required
                placeholder="e.g. Main Till - Downtown Store"
                value={terminalName}
                onChange={(e) => setTerminalName(e.target.value)}
                className="mt-1.5 w-full rounded-lg px-3 py-2 text-sm outline-none bg-white/[0.04] border border-white/10 text-white focus:border-white/30"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-neutral-400">Currency</span>
              <select
                value={posCurrency}
                onChange={(e) => setPosCurrency(e.target.value)}
                className="mt-1.5 w-full rounded-lg px-3 py-2 text-sm outline-none bg-white/[0.04] border border-white/10 text-white focus:border-white/30"
              >
                <option value="USDC" className="bg-[#0A0A0A] text-white">USDC</option>
                <option value="SOL" className="bg-[#0A0A0A] text-white">SOL</option>
                <option value="EURC" className="bg-[#0A0A0A] text-white">EURC</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={registering}
              className="flex items-center justify-center gap-2 bg-white text-black font-semibold rounded-full px-5 py-2 text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {registering ? 'Linking…' : <><Plus size={15} /> Link Device</>}
            </button>
          </form>

          {registered && (
            <p className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
              <CheckCircle2 size={16} /> Terminal paired successfully and ready for in-person payments.
            </p>
          )}

          <div className="pt-6 border-t border-white/10">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-neutral-400 mb-3">Linked Devices</p>
            <div className="divide-y divide-white/10">
              {LINKED_DEVICES.map((d) => (
                <div key={d.name} className="flex items-center gap-3 py-3">
                  <Smartphone size={16} className="text-neutral-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{d.name}</p>
                    <p className="text-xs text-neutral-400">{d.note}</p>
                  </div>
                  {d.online && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white flex-shrink-0">Online</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
