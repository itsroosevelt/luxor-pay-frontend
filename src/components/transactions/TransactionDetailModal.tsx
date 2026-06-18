"use client";

import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Copy, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Transfer } from "@/lib/transfers-api";
import { getExplorerTxUrl } from "@/web3/config/network";
import { getTokenSymbol } from "@/lib/token-registry";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`;

const ModalCard = styled(motion.div)`
  background: #0A0A0A;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 32px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 32px 64px -16px rgba(0, 0, 0, 0.8);
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Title = styled.h3`
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  margin: 0;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EDEDED;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const ModalBody = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.span`
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #60A5FA;
`;

const ValueBox = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ValueText = styled.span`
  font-family: monospace;
  font-size: 14px;
  color: #EDEDED;
  word-break: break-all;
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #60A5FA;
  text-decoration: none;
  background: rgba(37, 99, 235, 0.1);
  padding: 12px 24px;
  border-radius: 9999px;
  transition: all 0.2s;
  justify-content: center;
  margin-top: 8px;

  &:hover {
    background: rgba(37, 99, 235, 0.2);
    color: #FFFFFF;
  }
`;

interface TransactionDetailModalProps {
  transfer: Transfer | null;
  onClose: () => void;
  merchantWallet: string | null;
}

export function TransactionDetailModal({ transfer, onClose, merchantWallet }: TransactionDetailModalProps) {
  if (!transfer) return null;

  const isSent = merchantWallet ? transfer.fromWallet === merchantWallet : false;
  const symbol = getTokenSymbol(transfer.mint) || transfer.symbol || 'SOL';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('transaction-receipt');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, { 
        backgroundColor: '#0A0A0A',
        scale: 2 
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Transaction_${transfer.id.slice(0,8)}.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF', e);
    }
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ModalCard
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring" as const, bounce: 0.4, duration: 0.6 }}
          onClick={(e) => e.stopPropagation()}
        >
          <ModalHeader>
            <Title>Transaction Details</Title>
            <ActionsContainer>
              <CloseButton onClick={handleDownloadPDF} title="Download PDF">
                <Download size={18} />
              </CloseButton>
              <CloseButton onClick={onClose} title="Close">
                <X size={18} />
              </CloseButton>
            </ActionsContainer>
          </ModalHeader>
          <ModalBody id="transaction-receipt">
            <DetailRow>
              <Label>Type</Label>
              <ValueText style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {isSent ? "Sent Payment" : "Received Payment"}
              </ValueText>
            </DetailRow>

            <DetailRow>
              <Label>Amount</Label>
              <ValueBox>
                <ValueText style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {transfer.amount} {symbol}
                </ValueText>
              </ValueBox>
            </DetailRow>

            <DetailRow>
              <Label>From {(!isSent && transfer.toNickname) ? "Nickname / Address" : "Address"}</Label>
              <ValueBox>
                <ValueText>{!isSent && transfer.toNickname ? transfer.toNickname : transfer.fromWallet}</ValueText>
                {!(!isSent && transfer.toNickname) && (
                  <button onClick={() => copyToClipboard(transfer.fromWallet)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    <Copy size={16} />
                  </button>
                )}
              </ValueBox>
            </DetailRow>

            <DetailRow>
              <Label>To {isSent && transfer.toNickname ? "Nickname" : "Address"}</Label>
              <ValueBox>
                <ValueText>{isSent && transfer.toNickname ? transfer.toNickname : transfer.toWallet}</ValueText>
                <button onClick={() => copyToClipboard(transfer.toWallet)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <Copy size={16} />
                </button>
              </ValueBox>
            </DetailRow>

            {transfer.reference && (
              <DetailRow>
                <Label>Reference</Label>
                <ValueBox>
                  <ValueText>{transfer.reference}</ValueText>
                </ValueBox>
              </DetailRow>
            )}

            <DetailRow>
              <Label>Date</Label>
              <ValueText style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {new Date(transfer.createdAt).toLocaleString()}
              </ValueText>
            </DetailRow>

            {transfer.signature && (
              <>
                <DetailRow>
                  <Label>Signature</Label>
                  <ValueBox>
                    <ValueText>{transfer.signature.slice(0, 16)}...{transfer.signature.slice(-16)}</ValueText>
                    <button onClick={() => copyToClipboard(transfer.signature!)} className="text-gray-400 hover:text-white transition-colors cursor-pointer" data-html2canvas-ignore>
                      <Copy size={16} />
                    </button>
                  </ValueBox>
                </DetailRow>
                <LinkButton href={getExplorerTxUrl(transfer.signature)} target="_blank" rel="noopener noreferrer" data-html2canvas-ignore>
                  View on Explorer <ExternalLink size={16} />
                </LinkButton>
              </>
            )}
          </ModalBody>
        </ModalCard>
      </Overlay>
    </AnimatePresence>
  );
}
