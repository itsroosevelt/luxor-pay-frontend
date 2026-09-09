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
    name: 'Luxor Treasury Multisig v2',
    programId: 'SQDS2n2Vthf9s9tK2L4X6N3M7P1v9K2L4X6N3M7P1v9',
    authority: 'Multisig Vault (3/7 Threshold)',
    version: 'v2.4.0',
    status: 'Verified',
    deployedDate: '12 May 2024',
  },
  {
    id: 'prog-2',
    name: 'Luxor Payment Gateway & POS',
    programId: 'LXRPAY1111111111111111111111111111111111111',
    authority: 'Upgrade Authority Locked',
    version: 'v1.8.2',
    status: 'Verified',
    deployedDate: '01 Jun 2024',
  },
  {
    id: 'prog-3',
    name: 'Luxor Token Launchpad Engine',
    programId: 'LXRLAUNCH111111111111111111111111111111111',
    authority: 'Time-lock DAO Multisig',
    version: 'v3.1.0',
    status: 'Audited',
    deployedDate: '18 Jul 2024',
  },
];

// ─── Styled Components ────────────────────────────────────────────────────────

const PageContainer = styled.div`
  min-height: 100vh;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
`;

const ContentLayout = styled.div`
  padding: 64px 40px 60px 40px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 768px) {
    padding: 20px 16px 40px 16px;
    gap: 20px;
  }
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
`;

const HeaderTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TitleText = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
  letter-spacing: -1.5px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SubtitleText = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 900px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 20px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.6);
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatValue = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
`;

const TableWrapper = styled(motion.div)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.6);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  background: rgba(255, 255, 255, 0.04);
  padding: 14px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 18px 20px;
  font-size: 14px;
  color: #ededed;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
`;

const Tr = styled.tr`
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child ${Td} {
    border-bottom: none;
  }
`;

const ProgramIconBox = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%);
  border: 1px solid rgba(96, 165, 250, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
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
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
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
    <PageContainer>
      <ContentLayout>
        <HeaderRow>
          <HeaderTitleGroup>
            <TitleText>
              <Code2 size={30} style={{ color: '#60A5FA' }} /> Solana Smart Contracts
            </TitleText>
            <SubtitleText>
              Deployed smart contract program IDs, BPF loader status, and multi-sig upgrade authorities.
            </SubtitleText>
          </HeaderTitleGroup>
        </HeaderRow>

        <StatsGrid>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <StatLabel>
              <Cpu size={14} style={{ color: '#60A5FA' }} /> Total Programs
            </StatLabel>
            <StatValue>{PROGRAMS.length}</StatValue>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StatLabel>
              <ShieldCheck size={14} style={{ color: '#34D399' }} /> Security Status
            </StatLabel>
            <StatValue>100% Verified</StatValue>
          </StatCard>

          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StatLabel>
              <Terminal size={14} style={{ color: '#F59E0B' }} /> BPF Network
            </StatLabel>
            <StatValue>Solana Mainnet</StatValue>
          </StatCard>
        </StatsGrid>

        <TableWrapper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.7 }}
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
                          Version {prog.version} · Deployed {prog.deployedDate}
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
                        onClick={() => handleCopy(prog.programId, prog.id)}
                        title="Copy Program ID"
                      >
                        {copiedId === prog.id ? <Check size={13} style={{ color: '#34D399' }} /> : <Copy size={13} />}
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
                    {prog.authority}
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    <StatusBadge>
                      <ShieldCheck size={11} /> {prog.status}
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

