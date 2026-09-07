'use client';

import React from 'react';
import styled from 'styled-components';
import { Code2, Cpu, ShieldCheck, ExternalLink, Key } from 'lucide-react';

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

const PROGRAMS = [
  {
    id: 'prog-1',
    name: 'Luxor Treasury Multisig v2',
    programId: 'SQDS2n2Vthf9s9tK2L4X6N3M7P1v9K2L4X6N3M7P1v9',
    authority: 'Multisig Vault (3/7 Threshold)',
    status: 'Verified',
  },
  {
    id: 'prog-2',
    name: 'Luxor Payment Gateway & POS',
    programId: 'LXRPAY1111111111111111111111111111111111111',
    authority: 'Upgrade Authority Locked',
    status: 'Verified',
  },
];

export default function ProgramsPage() {
  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            Solana Smart Contracts
          </h1>
          <p className="lx-page-subtitle">
            Deployed smart contract program IDs, BPF loader status, and multi-sig upgrade authorities.
          </p>
        </div>
      </header>

      <ContentLayout>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-mono border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-xs text-gray-400 font-normal">
                  <th className="pb-3 pt-2 font-['Outfit']">Program Name</th>
                  <th className="pb-3 pt-2 font-['Outfit']">Program ID</th>
                  <th className="pb-3 pt-2 font-['Outfit']">Upgrade Authority</th>
                  <th className="pb-3 pt-2 text-right font-['Outfit']">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {PROGRAMS.map((prog) => (
                  <tr key={prog.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                          <Cpu size={15} />
                        </div>
                        <span className="font-['Outfit'] font-semibold text-sm text-white">
                          {prog.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-gray-300">
                      <div className="flex items-center gap-2">
                        <span>{prog.programId.slice(0, 8)}...{prog.programId.slice(-6)}</span>
                        <a
                          href={`https://solscan.io/account/${prog.programId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-400">
                      {prog.authority}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                        <ShieldCheck size={12} /> {prog.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ContentLayout>
    </PageContainer>
  );
}
