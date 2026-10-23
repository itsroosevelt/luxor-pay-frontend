"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
`;

const ModalContent = styled(motion.div)`
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 32px 64px -16px rgba(0,0,0,0.8);
  border-radius: 40px;
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  margin: 0;
`;

const Subtitle = styled.p`
  font-family: 'Montserrat', sans-serif;
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid #E2E8F0;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant = 'primary' }) =>
    $variant === 'primary' &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.45);
    }
  `}

  ${({ $variant }) =>
    $variant === 'secondary' &&
    `
    background: transparent;
    color: #E2E8F0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
    }
  `}

  ${({ $variant }) =>
    $variant === 'danger' &&
    `
    background: transparent;
    color: #F87171;
    border: 1px solid rgba(248, 113, 113, 0.3);
    &:hover:not(:disabled) {
      background: rgba(248, 113, 113, 0.1);
    }
  `}
`;

export function DeleteConfirmationModal({ 
  isOpen, 
  isLoading, 
  onClose, 
  onConfirm,
  title = "Remove Contact?",
  message = "Are you sure you want to remove this contact from your network? This action cannot be undone."
}: DeleteConfirmationModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isLoading ? onClose : undefined}
      >
        <ModalContent
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
        >
          <Title>{title}</Title>
          <Subtitle>{message}</Subtitle>

          <ButtonGroup>
            <Button 
              type="button" 
              $variant="secondary" 
              onClick={onClose} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              $variant="danger" 
              onClick={onConfirm} 
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Removing...' : 'Remove'}
            </Button>
          </ButtonGroup>
        </ModalContent>
      </Overlay>
    </AnimatePresence>,
    document.body
  );
}
