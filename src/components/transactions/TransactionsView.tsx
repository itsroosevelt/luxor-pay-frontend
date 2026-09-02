"use client";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Transfer, TransfersResponse } from "@/lib/transfers-api";
import { TransactionCard } from "./TransactionCard";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, ListFilter, RotateCw, Send } from "lucide-react";

const ViewWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
`;

const AmbientGlow = styled.div`
  display: none;
`;

const AmbientGlowLeft = styled.div`
  display: none;
`;

const ViewContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-width: 0;
`;

const ControlsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 12px 20px;
  backdrop-filter: blur(20px);
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 14px;
    gap: 12px;
  }
`;

const SelectorsRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 767px) {
    flex-wrap: nowrap;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }
`;

const ButtonLabel = styled.span`
  @media (max-width: 767px) {
    display: none;
  }
`;

const StatusSelectWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const StatusSelectIcon = styled.div`
  display: none;
  pointer-events: none;
  color: #FFFFFF;

  @media (max-width: 767px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const StyledSelect = styled.select`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px; /* Circular Rule 3 */
  padding: 8px 18px;
  color: #FFFFFF;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  
  option {
    background: #0A0A0A;
    color: #FFFFFF;
  }
`;

const StatusSelect = styled(StyledSelect)`
  @media (max-width: 767px) {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    border: none;
    background: transparent;
    padding: 0;
    min-width: 0;
    box-shadow: none;
  }
`;

const PageSizeSelect = styled(StyledSelect)`
  @media (max-width: 767px) {
    font-size: 12px;
    padding: 8px 12px;
    flex-shrink: 1;
    min-width: 0;
  }
`;

const TransferButton = styled.button`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFFFFF;
  color: #000000;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.15);
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #10B981;
    color: #FFFFFF;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }

  @media (max-width: 767px) {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    flex-shrink: 0;
  }
`;

const ReloadButton = styled.button<{ $isLoading?: boolean }>`
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 9999px; /* Pill shape Rule 3 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: #FFFFFF;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.18);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }

  svg {
    transition: transform 0.4s ease;
    ${({ $isLoading }) => $isLoading && `animation: spin 0.8s linear infinite;`}
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @media (max-width: 767px) {
    width: 40px;
    height: 40px;
    padding: 0;
    justify-content: center;
    flex-shrink: 0;
  }
`;

const DateGroupHeader = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  margin: 16px 0 8px 0;
  letter-spacing: 0.02em;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-width: 0;
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonCard = styled.div`
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(90deg, rgba(255,255,255, 0.01) 25%, rgba(255,255,255, 0.04) 50%, rgba(255,255,255, 0.01) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
  border: 1px solid rgba(255, 255, 255, 0.04);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.4);
  gap: 16px;
  font-family: 'Montserrat', sans-serif;
  backdrop-filter: blur(20px);
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 20px;
  color: #FCA5A5;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 0 4px;
`;

const PageInfo = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
  min-width: 0;

  @media (max-width: 767px) {
    font-size: 12px;
    line-height: 1.4;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px; /* Circular button styling (Rule 3) */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 18px;
  color: #EDEDED;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 13px;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  backdrop-filter: blur(12px);

  &:hover:not(:disabled) {
    background: #FFFFFF;
    color: #000000;
    border-color: #FFFFFF;
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }
`;

interface TransactionsViewProps {
  data: TransfersResponse | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  merchantWallet: string | null;
  offset: number;
  limit: number;
  status?: string;
  onNextPage: () => void;
  onPrevPage: () => void;
  onSelectTransaction: (transfer: Transfer) => void;
  onSetLimit: (limit: number) => void;
  onSetStatus: (status: string | undefined) => void;
  onRefresh?: () => void;
  onTransferClick?: () => void;
}

export function TransactionsView({
  data,
  isLoading,
  isError,
  errorMessage,
  merchantWallet,
  offset,
  limit,
  status,
  onNextPage,
  onPrevPage,
  onSelectTransaction,
  onSetLimit,
  onSetStatus,
  onRefresh,
  onTransferClick,
}: TransactionsViewProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = data?.totalPages || 1;
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  // Group transactions by date
  const groupedTransactions: Record<string, Transfer[]> = {};
  if (data?.data) {
    data.data.forEach((transfer) => {
      const dateObj = new Date(transfer.createdAt);
      const dateKey = dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
      if (!groupedTransactions[dateKey]) {
        groupedTransactions[dateKey] = [];
      }
      groupedTransactions[dateKey].push(transfer);
    });
  }

  if (isError) {
    return (
      <ViewContainer>
        <ErrorContainer>
          <AlertCircle size={20} />
          <span>{errorMessage || "Failed to load transactions."}</span>
        </ErrorContainer>
      </ViewContainer>
    );
  }

  return (
    <ViewWrapper>
      <AmbientGlow />
      <AmbientGlowLeft />
      <ViewContainer>
        {/* Controls & Pagination Header */}
        <ControlsHeader>
          <PageInfo>
            {data !== null ? `Showing ${data.data.length} of ${data.total} transactions` : 'Loading...'}
          </PageInfo>
          <SelectorsRow>
            <StatusSelectWrapper title={status ? `Status: ${status}` : 'All Statuses'}>
              <StatusSelectIcon aria-hidden>
                <ListFilter size={18} />
              </StatusSelectIcon>
              <StatusSelect
                value={status || ""}
                onChange={(e) => onSetStatus(e.target.value || undefined)}
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="FAILED">Failed</option>
              </StatusSelect>
            </StatusSelectWrapper>
            <PageSizeSelect
              value={limit}
              onChange={(e) => onSetLimit(Number(e.target.value))}
              aria-label="Results per page"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </PageSizeSelect>
            {onRefresh && (
              <ReloadButton
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                $isLoading={isLoading}
                title="Reload transactions"
                aria-label="Reload transactions"
              >
                <RotateCw size={16} />
                <ButtonLabel>Reload</ButtonLabel>
              </ReloadButton>
            )}
            {onTransferClick && (
              <TransferButton onClick={onTransferClick} title="Transfer Funds" aria-label="Transfer Funds">
                <Send size={16} />
                <ButtonLabel>Transfer Funds</ButtonLabel>
              </TransferButton>
            )}
          </SelectorsRow>
        </ControlsHeader>

        {/* Transactions List */}
        <ListContainer>
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : !data || data.data.length === 0 ? (
            <EmptyState>
              <Inbox size={40} className="opacity-40" />
              <p>No transactions found for this account.</p>
            </EmptyState>
          ) : (
            Object.entries(groupedTransactions).map(([dateLabel, transfers]) => (
              <div key={dateLabel} className="flex flex-col gap-3">
                <DateGroupHeader>{dateLabel}</DateGroupHeader>
                {transfers.map((transfer, idx) => (
                  <TransactionCard
                    key={transfer.id}
                    transfer={transfer}
                    merchantWallet={merchantWallet}
                    index={idx}
                    onClick={() => onSelectTransaction(transfer)}
                  />
                ))}
              </div>
            ))
          )}
        </ListContainer>

        {/* Pagination Footer */}
        {!isLoading && data && data.totalPages > 1 && (
          <PaginationContainer>
            <PageInfo>Page {currentPage} of {totalPages}</PageInfo>
            <ButtonGroup>
              <PageButton onClick={onPrevPage} disabled={!hasPrev}>
                <ChevronLeft size={16} /> Previous
              </PageButton>
              <PageButton onClick={onNextPage} disabled={!hasNext}>
                Next <ChevronRight size={16} />
              </PageButton>
            </ButtonGroup>
          </PaginationContainer>
        )}
      </ViewContainer>
    </ViewWrapper>
  );
}
