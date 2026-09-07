'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Code2,
  Plus,
  FileCode,
  Layers,
  Vote,
  Database,
  Download,
  Terminal,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

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

const TEMPLATES = [
  { id: 'custom', title: 'Custom Instruction', subtitle: 'create', icon: Code2 },
  { id: 'base58', title: 'Import base58 encoded tx', subtitle: 'import', icon: Download },
  { id: 'token', title: 'Token Program', subtitle: 'template', icon: FileCode },
  { id: 'stake', title: 'Stake Program', subtitle: 'template', icon: Layers },
  { id: 'vote', title: 'Vote Program', subtitle: 'template', icon: Vote },
  { id: 'stakepool', title: 'Stake Pool Program', subtitle: 'template', icon: Database },
];

export default function TxBuilderPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleTemplateClick = (title: string) => {
    setActiveModal(title);
  };

  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            Transaction Builder
          </h1>
          <p className="lx-page-subtitle">
            Draft, sign, and broadcast custom Solana instructions and multi-sig program transactions.
          </p>
        </div>
      </header>

      <ContentLayout>
        <div className="space-y-10">
          {/* Empty State Banner */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-12 md:p-16 text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-light text-white font-['Outfit']">
              No Transactions yet
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
              To create a draft click on «Create transaction» or choose one of the templates below!
            </p>
          </div>

          {/* Templates Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white font-['Outfit'] tracking-wide">
              Templates
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleTemplateClick(tmpl.title)}
                  className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-left transition-all group flex flex-col justify-between h-32"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white font-['Outfit'] group-hover:text-blue-400 transition-colors">
                      {tmpl.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs text-gray-400 pt-2 border-t border-white/5">
                    <span>{tmpl.subtitle}</span>
                    <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/15 flex items-center justify-center text-white transition-colors">
                      <Plus size={14} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ContentLayout>

      {/* Template Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0A0A0A] border border-white/15 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold font-['Outfit'] flex items-center gap-2">
                <Terminal size={16} className="text-blue-400" /> {activeModal}
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed font-mono">
              Drafting instruction template for {activeModal}. Configure program ID, instruction discriminator, and account keys below.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-gray-400 block font-['Outfit']">Program ID</label>
                <input
                  type="text"
                  placeholder="11111111111111111111111111111111"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  toast.success(`Transaction draft for ${activeModal} created!`);
                  setActiveModal(null);
                }}
                className="w-full py-3 rounded-full bg-white text-black font-['Outfit'] font-semibold text-xs hover:bg-gray-200 transition-colors mt-2"
              >
                Create Transaction Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
