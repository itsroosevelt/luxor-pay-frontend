'use client';

import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { clsx } from 'clsx';

const CHART_POINTS = [40, 44, 42, 48, 52, 50, 58, 63, 60, 68, 72, 70, 78];

export default function TerminalPage() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');

  const w = 600;
  const h = 200;
  const max = Math.max(...CHART_POINTS);
  const min = Math.min(...CHART_POINTS);
  const points = CHART_POINTS.map((v, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(' ');

  return (
    <>
      <header className="lx-page-header">
        <h1 className="lx-page-title">Terminal</h1>
        <p className="lx-page-subtitle">Vista de trading avanzada para tus tokens y pools.</p>
      </header>

      <div className="w-full max-w-[1200px] p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold bg-white/10 border border-white/15 text-white">LXR</span>
                <div>
                  <p className="text-sm font-medium text-white">LXR / SOL</p>
                  <p className="text-[11px] text-white/50">Raydium AMM V4</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white">$0.0731</p>
                <p className="text-[11px] text-white/50">+12.8% (24h)</p>
              </div>
            </div>

            <svg viewBox={`0 0 ${w} ${h}`} className="h-[200px] w-full" preserveAspectRatio="none">
              <polyline points={points} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
              <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#terminalGradient)" opacity="0.12" />
              <defs>
                <linearGradient id="terminalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                </linearGradient>
              </defs>
            </svg>

            <dl className="grid grid-cols-3 gap-4 text-xs pt-3 border-t border-white/10">
              <div><dt className="text-white/40">Volumen 24h</dt><dd className="font-medium text-white">$48,210</dd></div>
              <div><dt className="text-white/40">Liquidez</dt><dd className="font-medium text-white">$145,280</dd></div>
              <div><dt className="text-white/40">Holders</dt><dd className="font-medium text-white">312</dd></div>
            </dl>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-white/60" />
              <h2 className="lx-eyebrow">Orden rápida</h2>
            </div>

            <div className="inline-flex w-full gap-1 rounded-full p-1 bg-white/5 border border-white/15">
              {(['buy', 'sell'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={clsx('flex-1 rounded-full py-2 text-xs font-semibold transition-all')}
                  style={side === s
                    ? { background: '#FFFFFF', color: '#000000' }
                    : { color: 'rgba(255,255,255,0.6)', background: 'transparent' }}
                >
                  {s === 'buy' ? 'Comprar' : 'Vender'}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="text-xs font-medium text-white/60">Monto (SOL)</span>
              <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5 w-full rounded-full px-4 py-2.5 text-sm outline-none bg-white/5 border border-white/15 text-white focus:border-white/40 transition-colors" />
            </label>

            <button type="button" className="w-full py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors">
              {side === 'buy' ? 'Comprar LXR' : 'Vender LXR'}
            </button>

            <p className="text-[11px] text-white/40">
              Terminal de ejemplo — la ejecución real requiere el SDK de Squads + wallet-adapter.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
