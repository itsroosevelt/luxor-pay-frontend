"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Check,
  CheckCircle2,
  CircleDot,
  Clock,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { Transfer } from "@/features/transfers/api/transfers-api";
import { useTokenRegistry } from '@/context/TokenRegistryContext';
import { downloadTransactionReceipt } from '@/features/transactions/lib/pdf-generator';
import { getExplorerTxUrl } from "@/web3/config/network";
import { TokenIcon } from "@/components/ui/TokenIcon";
import {
  ItemContainer,
  MainRow,
  LeftSection,
  RightSection,
  PartyAndDate,
  PartyTitle,
  DateSubtitle,
  AmountAndStatus,
  IconBadge,
  ValueAmount,
  StatusPill,
  ExpandIconButton,
  ExpandedDrawer,
  DrawerPanel,
  PanelTitle,
  DetailRow,
  DetailKey,
  DetailVal,
  LinkButton,
  ExplorerButton,
  DrawerButtonGroup,
  DrawerButton,
  ProgressGrid,
  TimelineContainer,
  TimelineStep,
  TimelineDot,
  TimelineInfo,
  TimelineText,
  TimelineSub,
  SignersBox,
  SignerTitle,
  SignerItem,
} from './TransactionCard.styles';

const COLOR_SENT = "#F87171";
const COLOR_RECEIVED = "#E2E8F0";
const COLOR_FAILED = "#FBBF24";

function TokenIconGraphic({ symbol }: { symbol: string }) {
  return <TokenIcon symbol={symbol} size={20} />;
}

interface TransactionCardProps {
  transfer: Transfer;
  merchantWallet: string | null;
  onClick: () => void;
  index: number;
}

export function TransactionCard({ transfer, merchantWallet, onClick, index }: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isSent = merchantWallet ? transfer.fromWallet === merchantWallet : false;
  const type = isSent ? 'sent' : 'received';
  const { getTokenSymbol } = useTokenRegistry();
  const symbol = (getTokenSymbol(transfer.mint) || transfer.symbol || 'SOL').toUpperCase();

  const dateObj = new Date(transfer.createdAt);
  
  // Date and Time formatting (e.g. "Jul 7, 11:53 PM")
  const dateFormatted = dateObj.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
  const timeFormatted = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateLabel = `${dateFormatted}, ${timeFormatted}`;

  const fullDateFormatted = dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fromAddress = transfer.fromWallet || "";
  const toAddress = transfer.toWallet || "";
  const partyLabel = isSent ? 'To: ' : 'From: ';
  const partyName = isSent 
    ? (transfer.toNickname || (toAddress ? `${toAddress.slice(0, 4)}...${toAddress.slice(-4)}` : "External Wallet"))
    : (fromAddress ? `${fromAddress.slice(0, 4)}...${fromAddress.slice(-4)}` : "External Wallet");

  const statusUpper = (transfer.status || '').toUpperCase();
  const isConfirmed = statusUpper === 'CONFIRMED' || statusUpper === 'EXECUTED' || statusUpper === 'SUCCESS' || statusUpper === 'COMPLETED';
  const isFailed = statusUpper === 'FAILED' || statusUpper === 'REJECTED' || statusUpper === 'ERROR' || statusUpper === 'REVERTED';
  const isPending = statusUpper === 'PENDING' || statusUpper === 'PROCESSING' || statusUpper === 'SUBMITTED' || statusUpper === 'AWAITING_SIGNATURE';
  const isCancelled = statusUpper === 'CANCELLED';

  const statusDisplay = isConfirmed 
    ? 'Confirmed' 
    : isFailed 
    ? (statusUpper === 'REJECTED' ? 'Rejected' : 'Failed') 
    : isPending 
    ? 'Pending' 
    : isCancelled 
    ? 'Cancelled' 
    : transfer.status;

  const explorerUrl = transfer.signature 
    ? getExplorerTxUrl(transfer.signature) 
    : `https://explorer.solana.com/address/${merchantWallet || ''}?cluster=devnet`;

  const executedOnDisplay = isConfirmed
    ? (transfer.confirmedAt
        ? new Date(transfer.confirmedAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : fullDateFormatted)
    : isFailed
    ? 'Failed'
    : isPending
    ? 'Pending'
    : isCancelled
    ? 'Cancelled'
    : 'N/A';

  const visualType: 'sent' | 'received' | 'failed' = (isFailed || isCancelled) ? 'failed' : type;

  const copyText = (e: React.MouseEvent, text: string, keyName: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  return (
    <ItemContainer
      $visualType={visualType}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.012 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.45, delay: index * 0.02 }}
    >
      <MainRow onClick={handleToggleExpand}>
        <LeftSection>
          <IconBadge $visualType={visualType}>
            {visualType === 'failed' ? (
              <AlertCircle size={20} />
            ) : visualType === 'sent' ? (
              <ArrowUpRight size={20} />
            ) : (
              <ArrowDownLeft size={20} />
            )}
          </IconBadge>
          <PartyAndDate>
            <PartyTitle>
              {partyLabel}<strong className="notranslate font-medium text-white/90" translate="no">{partyName}</strong>
            </PartyTitle>
            <DateSubtitle>
              <Clock size={11} className="opacity-40" />
              <span>{dateLabel}</span>
            </DateSubtitle>
          </PartyAndDate>
        </LeftSection>

        <RightSection>
          <AmountAndStatus>
            <ValueAmount className="notranslate" translate="no">
              {type === 'sent' ? '-' : '+'}{transfer.amount}
              <TokenIconGraphic symbol={symbol} />
            </ValueAmount>
            <StatusPill $status={transfer.status}>
              {statusDisplay}
            </StatusPill>
          </AmountAndStatus>

          <ExpandIconButton
            type="button"
            onClick={handleToggleExpand}
            title={isExpanded ? "Collapse details" : "Expand details"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </ExpandIconButton>
        </RightSection>
      </MainRow>

      <AnimatePresence>
        {isExpanded && (
          <ExpandedDrawer
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Rich Info Panel with ALL transaction details */}
            <DrawerPanel>
              <PanelTitle>Info</PanelTitle>

              <DetailRow>
                <DetailKey>Author / Party</DetailKey>
                <DetailVal className="notranslate" translate="no">{partyName}</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>From Address</DetailKey>
                <DetailVal className="notranslate" translate="no">
                  <span>{fromAddress ? `${fromAddress.slice(0, 6)}...${fromAddress.slice(-6)}` : 'N/A'}</span>
                  {fromAddress && (
                    <button
                      type="button"
                      onClick={(e) => copyText(e, fromAddress, 'from')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy From Address"
                    >
                      {copiedKey === 'from' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>To Address</DetailKey>
                <DetailVal className="notranslate" translate="no">
                  <span>{toAddress ? `${toAddress.slice(0, 6)}...${toAddress.slice(-6)}` : 'N/A'}</span>
                  {toAddress && (
                    <button
                      type="button"
                      onClick={(e) => copyText(e, toAddress, 'to')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy To Address"
                    >
                      {copiedKey === 'to' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </DetailVal>
              </DetailRow>

              {transfer.reference && (
                <DetailRow>
                  <DetailKey>Reference ID</DetailKey>
                  <DetailVal className="notranslate" translate="no">
                    <span>{transfer.reference.length <= 32 ? transfer.reference : `${transfer.reference.slice(0, 24)}...`}</span>
                    <button
                      type="button"
                      onClick={(e) => copyText(e, transfer.reference!, 'ref')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy Reference ID"
                    >
                      {copiedKey === 'ref' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  </DetailVal>
                </DetailRow>
              )}

              <DetailRow>
                <DetailKey>Account</DetailKey>
                <DetailVal>Merchant Main Account</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>Created on</DetailKey>
                <DetailVal>{fullDateFormatted}</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>Executed on</DetailKey>
                <DetailVal>{executedOnDisplay}</DetailVal>
              </DetailRow>

              <DetailRow>
                <DetailKey>Transaction Hash</DetailKey>
                <DetailVal>
                  <LinkButton href={explorerUrl} target="_blank" rel="noopener noreferrer" className="notranslate" translate="no">
                    <span>{transfer.signature ? `${transfer.signature.slice(0, 6)}...${transfer.signature.slice(-6)}` : 'Solana Explorer'}</span>
                    <ExternalLink size={12} />
                  </LinkButton>
                  {transfer.signature && (
                    <button
                      type="button"
                      onClick={(e) => copyText(e, transfer.signature!, 'sig')}
                      className="p-1 text-gray-500 hover:text-white transition-colors"
                      title="Copy transaction signature"
                    >
                      {copiedKey === 'sig' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    </button>
                  )}
                </DetailVal>
              </DetailRow>

              <DrawerButtonGroup>
                <ExplorerButton
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on Explorer <ExternalLink size={14} />
                </ExplorerButton>
                <DrawerButton
                  type="button"
                  $variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadTransactionReceipt(transfer, symbol, merchantWallet);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={13} />
                  Download PDF
                </DrawerButton>
              </DrawerButtonGroup>
            </DrawerPanel>

            {/* Progress Panel with Signers */}
            <DrawerPanel>
              <PanelTitle>Progress</PanelTitle>

              <ProgressGrid>
                <TimelineContainer>
                  {/* Step 1: Created */}
                  <TimelineStep>
                    <TimelineDot $status="done">
                      <CheckCircle2 size={12} />
                    </TimelineDot>
                    <TimelineInfo>
                      <TimelineText>Transaction created</TimelineText>
                      <TimelineSub>{fullDateFormatted}</TimelineSub>
                    </TimelineInfo>
                  </TimelineStep>

                  {/* Step 2: Solana Confirmation Status */}
                  <TimelineStep>
                    <TimelineDot $status={isConfirmed ? 'done' : isFailed || isCancelled ? 'failed' : 'pending'}>
                      {isConfirmed ? (
                        <CheckCircle2 size={12} />
                      ) : isFailed || isCancelled ? (
                        <XCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                    </TimelineDot>
                    <TimelineInfo>
                      <TimelineText>
                        {isConfirmed
                          ? 'Confirmed on Solana'
                          : isFailed
                          ? (statusUpper === 'REJECTED' ? 'Rejected on Solana' : 'Failed on Solana')
                          : isCancelled
                          ? 'Cancelled'
                          : 'Processing on Solana'}
                      </TimelineText>
                      <TimelineSub>
                        {isConfirmed
                          ? '1/1 signatures approved'
                          : isFailed || isCancelled
                          ? (transfer.errorMessage || 'Signature rejected or transaction reverted')
                          : 'Awaiting block confirmation'}
                      </TimelineSub>
                    </TimelineInfo>
                  </TimelineStep>

                  {/* Step 3: Final Execution Status */}
                  <TimelineStep>
                    <TimelineDot $status={isConfirmed ? 'done' : isFailed || isCancelled ? 'failed' : 'pending'}>
                      {isConfirmed ? (
                        <CheckCircle2 size={12} />
                      ) : isFailed || isCancelled ? (
                        <XCircle size={12} />
                      ) : (
                        <CircleDot size={12} />
                      )}
                    </TimelineDot>
                    <TimelineInfo>
                      <TimelineText>
                        {isConfirmed
                          ? 'Executed'
                          : isFailed
                          ? 'Execution Failed'
                          : isCancelled
                          ? 'Cancelled'
                          : 'Pending Execution'}
                      </TimelineText>
                      <TimelineSub>
                        {isConfirmed
                          ? executedOnDisplay
                          : isFailed
                          ? 'Transaction could not be completed'
                          : isCancelled
                          ? 'Transaction aborted'
                          : 'Waiting for network completion'}
                      </TimelineSub>
                    </TimelineInfo>
                  </TimelineStep>
                </TimelineContainer>

                {/* Signers Box */}
                <SignersBox>
                  <SignerTitle>
                    <span>Confirmed</span>
                    {isConfirmed ? (
                      <strong className="text-green-400">1</strong>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </SignerTitle>

                  {isConfirmed && (
                    <>
                      {fromAddress && (
                        <SignerItem className="notranslate" translate="no">
                          <span className="text-gray-500">From:</span> {fromAddress.slice(0, 4)}...{fromAddress.slice(-4)}
                        </SignerItem>
                      )}
                      {toAddress && (
                        <SignerItem className="notranslate" translate="no">
                          <span className="text-gray-500">To:</span> {toAddress.slice(0, 4)}...{toAddress.slice(-4)}
                        </SignerItem>
                      )}
                    </>
                  )}

                  {isPending && (
                    <>
                      <SignerTitle style={{ marginTop: '8px' }}>
                        <span>Pending</span>
                        <strong className="text-blue-400">1</strong>
                      </SignerTitle>
                      {fromAddress && (
                        <SignerItem className="notranslate" translate="no">
                          <span className="text-blue-400/70">From:</span> {fromAddress.slice(0, 4)}...{fromAddress.slice(-4)}
                        </SignerItem>
                      )}
                    </>
                  )}

                  <SignerTitle style={{ marginTop: '8px' }}>
                    <span>Rejected</span>
                    {isFailed || isCancelled ? (
                      <strong className="text-red-400">1</strong>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </SignerTitle>

                  {(isFailed || isCancelled) && (
                    <>
                      {fromAddress && (
                        <SignerItem className="notranslate" translate="no">
                          <span className="text-red-400/70">From:</span> {fromAddress.slice(0, 4)}...{fromAddress.slice(-4)}
                        </SignerItem>
                      )}
                      {toAddress && (
                        <SignerItem className="notranslate" translate="no">
                          <span className="text-red-400/70">To:</span> {toAddress.slice(0, 4)}...{toAddress.slice(-4)}
                        </SignerItem>
                      )}
                    </>
                  )}
                </SignersBox>
              </ProgressGrid>
            </DrawerPanel>
          </ExpandedDrawer>
        )}
      </AnimatePresence>
    </ItemContainer>
  );
}
