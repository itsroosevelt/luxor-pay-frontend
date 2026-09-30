'use client';

import React from 'react';
import styled from 'styled-components';
import { TrendingUp, ExternalLink, Plus, Lock } from 'lucide-react';
import Link from 'next/link';

interface PoolItem {
  id: string;
  symbol: string;
  pair: string;
  dex: string;
  tvl: string;
  volume24h: string;
  myLiquidity: string;
  feesEarned: string;
  status: 'Active' | 'Locked' | 'Migrated';
  feeTier: string;
}

const POOLS: PoolItem[] = [];

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

export default function PoolsPage() {
  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <TrendingUp size={28} className="text-white shrink-0" /> My Pools &amp; Tokens
          </h1>
          <p className="lx-page-subtitle">
            Manage your deployed tokens, track DEX liquidity pool performance, and claim accrued LP fees.
          </p>
        </div>
      </header>

      <ContentLayout>
        {/* Pools Table (Frameless / Directly on canvas) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-white/60" />
              <h2 className="text-base font-semibold text-white font-['Outfit']">Registered DEX Pools &amp; Assets</h2>
              <span className="text-xs text-gray-400 font-mono ml-2">(4 Registered)</span>
            </div>
            <Link
              href="/token-launcher/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs hover:bg-gray-200 transition-colors shrink-0 shadow-lg"
            >
              <Plus size={15} /> Create New Pool
            </Link>
          </div>

          <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full text-left text-sm font-mono">
              <thead>
                <tr className="border-b border-white/15 text-xs text-gray-400 font-normal">
                  <th className="pb-3">Token / Pair</th>
                  <th className="pb-3">DEX Venue</th>
                  <th className="pb-3">Fee Tier</th>
                  <th className="pb-3">Total Pool TVL</th>
                  <th className="pb-3">24h Volume</th>
                  <th className="pb-3">My Liquidity</th>
                  <th className="pb-3">Fees Earned</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {POOLS.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 font-['Montserrat']">
                      No active liquidity positions. Click &quot;Add Liquidity&quot; above to deposit into a pool.
                    </td>
                  </tr>
                ) : (
                  POOLS.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3 font-['Outfit'] font-medium text-sm text-white">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold bg-white/10 border border-white/20 text-white">
                            {p.symbol}
                          </span>
                          <span>{p.pair}</span>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{p.dex}</td>
                      <td className="py-4 text-gray-400">{p.feeTier}</td>
                      <td className="py-4 font-bold text-white">{p.tvl}</td>
                      <td className="py-4 text-gray-300">{p.volume24h}</td>
                      <td className="py-4 font-bold text-white">{p.myLiquidity}</td>
                      <td className="py-4 text-gray-300">{p.feesEarned}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/10 border border-white/20 text-white">
                          {p.status === 'Locked' && <Lock size={10} />}
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <a
                          href="https://raydium.io"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          View on DEX <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ContentLayout>
    </PageContainer>
  );
}
