"use client";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Transfer, TransfersResponse } from "@/lib/transfers-api";
import { TransactionCard } from "./TransactionCard";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

const ViewWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const AmbientGlow = styled.div`
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(37, 99, 235, 0) 70%);
  top: -150px;
  right: -100px;
  pointer-events: none;
  z-index: 0;
`;

const AmbientGlowLeft = styled.div`
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, rgba(249, 115, 22, 0) 70%);
  bottom: -100px;
  left: -150px;
  pointer-events: none;
  z-index: 0;
`;

const ViewContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
`;

const SelectorsRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
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
    border-color: #2563EB;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
  
  option {
    background: #0A0A0A;
    color: #FFFFFF;
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
    outline: 2px solid #60A5FA;
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
            <StyledSelect
              value={status || ""}
              onChange={(e) => onSetStatus(e.target.value || undefined)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="FAILED">Failed</option>
            </StyledSelect>
            <StyledSelect
              value={limit}
              onChange={(e) => onSetLimit(Number(e.target.value))}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </StyledSelect>
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
