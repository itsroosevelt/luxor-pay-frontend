'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, ExternalLink, Code2, Copy, Check, Terminal, Layers } from 'lucide-react';
import { toast } from 'sonner';

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface ProgramItem {
  id: string;
  name: string;
  programId: string;
  authority: string;
  version: string;
  status: 'Verified' | 'Audited';
  deployedDate: string;
}

const PROGRAMS: ProgramItem[] = [
  {
    id: 'prog-1',
    name: 'Sterling Treasury Multisig v2',
    programId: 'SQDS2n2Vthf9s9tK2L4X6N3M7P1v9K2L4X6N3M7P1v9',
    authority: 'Multisig Vault (3/7 Threshold)',
    version: 'v2.4.0',
    status: 'Verified',
    deployedDate: '12 May 2024',
  },
  {
    id: 'prog-2',
    name: 'Sterling Payment Gateway & POS',
    programId: 'LXRPAY1111111111111111111111111111111111111',
    authority: 'Upgrade Authority Locked',
    version: 'v1.8.2',
    status: 'Verified',
    deployedDate: '01 Jun 2024',
  },
  {
    id: 'prog-3',
    name: 'Sterling Token Launchpad Engine',
    programId: 'LXRLAUNCH111111111111111111111111111111111',
    authority: 'Time-lock DAO Multisig',
    version: 'v3.1.0',
    status: 'Audited',
    deployedDate: '18 Jul 2024',
  },
];

// ─── Styled Components ────────────────────────────────────────────────────────

// ─── Styled Components ────────────────────────────────────────────────────────

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
`;

const ContentLayout = styled.div`
  padding: 0 40px 60px 40px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 768px) {
    padding: 0 16px 40px 16px;
    gap: 20px;
  }
`;

const HeaderRow = styled.div`
  padding: 28px 32px 16px 32px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding: 24px 16px 12px 16px;
  }
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleText = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.15;
`;

const SubtitleText = styled.p`
  margin-top: 4px;
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 0;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 900px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const StatCard = styled(motion.div)`
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0 0 16px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatLabel = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: -0.5px;
`;

const TableWrapper = styled(motion.div)`
  background: transparent;
  border: none;
  border-radius: 0;
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  background: transparent;
  padding: 12px 16px 12px 0;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  letter-spacing: 0.02em;
`;

const Td = styled.td`
  padding: 16px 16px 16px 0;
  font-size: 14px;
  color: #ededed;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
`;

const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &:last-child ${Td} {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const ProgramIconBox = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  flex-shrink: 0;
`;

const ProgramName = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
`;

const ProgramIdText = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProgramsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Program ID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <PageContainer suppressHydrationWarning>
      <HeaderRow>
        <HeaderTitleGroup>
          <TitleText>Solana Smart Contracts</TitleText>
          <SubtitleText>
            Deployed smart contract program IDs, BPF loader status, and multi-sig upgrade authorities.
          </SubtitleText>
        </HeaderTitleGroup>
      </HeaderRow>

      <ContentLayout suppressHydrationWarning>
        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatLabel>
              <Cpu size={13} /> <span>Total Programs</span>
            </StatLabel>
            <StatValue><span>{PROGRAMS.length}</span></StatValue>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <StatLabel>
              <ShieldCheck size={13} /> <span>Security Status</span>
            </StatLabel>
            <StatValue><span>100% Verified</span></StatValue>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <StatLabel>
              <Terminal size={13} /> <span>BPF Network</span>
            </StatLabel>
            <StatValue><span>Solana Mainnet</span></StatValue>
          </StatCard>
        </StatsGrid>

        <TableWrapper
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Table>
            <thead>
              <Tr>
                <Th>Program Name</Th>
                <Th>Program ID</Th>
                <Th>Upgrade Authority</Th>
                <Th style={{ textAlign: 'right' }}>Status</Th>
              </Tr>
            </thead>
            <tbody>
              {PROGRAMS.map((prog) => (
                <Tr key={prog.id}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <ProgramIconBox>
                        <Cpu size={18} />
                      </ProgramIconBox>
                      <div>
                        <ProgramName>{prog.name}</ProgramName>
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '2px' }}>
                          <span>Version {prog.version} · Deployed {prog.deployedDate}</span>
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ProgramIdText>
                        {prog.programId.slice(0, 8)}...{prog.programId.slice(-6)}
                      </ProgramIdText>
                      <CopyButton
                        type="button"
                        onClick={() => handleCopy(prog.programId, prog.id)}
                        title="Copy Program ID"
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {copiedId === prog.id ? <Check size={13} style={{ color: '#34D399' }} /> : <Copy size={13} />}
                        </span>
                      </CopyButton>
                      <a
                        href={`https://solscan.io/account/${prog.programId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'inline-flex' }}
                        title="View on Solscan"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </Td>
                  <Td style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
                    <span>{prog.authority}</span>
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    <StatusBadge>
                      <ShieldCheck size={11} /> <span>{prog.status}</span>
                    </StatusBadge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </ContentLayout>
    </PageContainer>
  );
}

