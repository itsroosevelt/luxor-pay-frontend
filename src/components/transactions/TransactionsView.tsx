"use client";

import React from "react";
import styled, { keyframes } from "styled-components";
import { Transfer, TransfersResponse } from "@/lib/transfers-api";
import { TransactionCard } from "./TransactionCard";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

const ViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SelectorsRow = styled.div`
  display: flex;
  gap: 16px;
`;

const Select = styled.select`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  color: #EDEDED;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: rgba(37, 99, 235, 0.5);
  }
  
  option {
    background: #111;
    color: #EDEDED;
  }
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
  height: 90px;
  border-radius: 24px;
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.05) 25%, rgba(96, 165, 250, 0.1) 50%, rgba(37, 99, 235, 0.05) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 2s infinite;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  color: rgba(255, 255, 255, 0.4);
  gap: 16px;
  font-family: 'Montserrat', sans-serif;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 24px;
  color: #FCA5A5;
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 0 8px;
`;

const PageInfo = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const PageButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  color: #EDEDED;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  font-size: 14px;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: rgba(37, 99, 235, 0.2);
    border-color: rgba(37, 99, 235, 0.5);
    color: #FFFFFF;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
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

  if (isError) {
    return (
      <ViewContainer>
        <ErrorContainer>
          <AlertCircle size={24} />
          <span>{errorMessage || "Failed to load transactions."}</span>
        </ErrorContainer>
      </ViewContainer>
    );
  }

  return (
    <ViewContainer>
      <HeaderRow>
        <PageInfo>
          {data !== null ? `Showing ${data.data.length} of ${data.total} transactions` : 'Loading...'}
        </PageInfo>
        <SelectorsRow>
          <Select 
            value={status || ""} 
            onChange={(e) => onSetStatus(e.target.value || undefined)}
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="FAILED">Failed</option>
          </Select>
          <Select 
            value={limit} 
            onChange={(e) => onSetLimit(Number(e.target.value))}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </Select>
        </SelectorsRow>
      </HeaderRow>

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
            <Inbox size={48} opacity={0.5} />
            <p>No transactions found for this account.</p>
          </EmptyState>
        ) : (
          data.data.map((transfer, idx) => (
            <TransactionCard
              key={transfer.id}
              transfer={transfer}
              merchantWallet={merchantWallet}
              index={idx}
              onClick={() => onSelectTransaction(transfer)}
            />
          ))
        )}
      </ListContainer>

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
  );
}
