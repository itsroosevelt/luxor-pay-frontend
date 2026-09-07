'use client';

import React from 'react';
import styled from 'styled-components';
import { Headphones, HelpCircle, ShieldCheck, Zap, Mail, ExternalLink, MessageCircle } from 'lucide-react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 32px 40px 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const FAQS = [
  {
    q: 'How does the Bonding Curve work?',
    a: 'When a new token is created, users buy and sell along a mathematical bonding curve. Once the market cap reaches $69k, 100% of the $12,000 SOL liquidity is automatically deposited into Raydium and burned forever.',
  },
  {
    q: 'Are token mint & freeze authorities revoked?',
    a: 'Yes, 100% automatically! Every token launched on the platform has its mint authority and freeze authority permanently revoked at creation.',
  },
  {
    q: 'What are the trading fees?',
    a: 'Trading on the bonding curve incurs a 1% fee which goes towards liquidity backing and platform maintenance.',
  },
];

export default function SupportPage() {
  return (
    <PageContainer>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title flex items-center gap-3">
            <Headphones size={28} className="text-white" /> Support & Help Center
          </h1>
          <p className="lx-page-subtitle">
            Get 24/7 assistance, read token launch guides, or contact our support team.
          </p>
        </div>
      </header>

      <ContentLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <h2 className="text-lg font-medium text-white font-['Outfit']">Email Support</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Reach our dedicated support team for account, token, or liquidity questions.
            </p>
            <a
              href="mailto:support@luxorpay.app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white underline hover:text-gray-300"
            >
              support@luxorpay.app <ExternalLink size={12} />
            </a>
          </div>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 text-white border border-white/15 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <h2 className="text-lg font-medium text-white font-['Outfit']">Telegram & Discord</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Join our active community channels for live support and developer alpha.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300">
              Community Channels Active <ShieldCheck size={13} className="text-white" />
            </span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
          <h2 className="text-lg font-semibold text-white font-['Outfit'] flex items-center gap-2">
            <HelpCircle size={20} className="text-white" /> Frequently Asked Questions
          </h2>
          <div className="divide-y divide-white/10">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-4 space-y-1">
                <h3 className="text-sm font-medium text-white font-['Outfit']">{faq.q}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </ContentLayout>
    </PageContainer>
  );
}

