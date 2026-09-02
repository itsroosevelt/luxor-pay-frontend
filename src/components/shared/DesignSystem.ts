"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

export const GlassCard = styled(motion.div)<{ $variant?: "default" | "hero" }>`
  background: var(--lx-surface, #111624);
  border: 1px solid var(--lx-border, #1E2638);
  border-radius: var(--lx-radius, 12px);
  box-shadow: var(--lx-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.28));
  padding: var(--lx-pad, 24px);
  position: relative;
  overflow: hidden;
  width: 100%;
`;

export const ButtonBase = styled.button<{ $variant?: "primary" | "secondary" | "glass" }>`
  font-family: 'Inter', 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--lx-radius-sm, 8px);
  padding: 10px 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease;
  border: 1px solid transparent;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: var(--lx-ring, 0 0 0 3px rgba(16, 185, 129, 0.28));
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    ($variant === "primary" || !$variant) &&
    `
    background: var(--lx-accent, #10B981);
    color: #05130D;
    &:hover:not(:disabled) {
      background: var(--lx-accent-hover, #0EA372);
    }
  `}

  ${({ $variant }) =>
    $variant === "secondary" &&
    `
    background: transparent;
    color: var(--lx-text, #F5F7FB);
    border: 1px solid var(--lx-border-strong, #2D3748);
    &:hover:not(:disabled) {
      background: var(--lx-surface-hover, #1A2133);
      border-color: var(--lx-border-hover, #38445c);
    }
  `}

  ${({ $variant }) =>
    $variant === "glass" &&
    `
    background: var(--lx-surface-2, #151B2B);
    color: var(--lx-text, #F5F7FB);
    border: 1px solid var(--lx-border, #1E2638);
    &:hover:not(:disabled) {
      background: var(--lx-surface-hover, #1A2133);
      border-color: var(--lx-border-hover, #38445c);
    }
  `}
`;

export const HeroTitle = styled.h1`
  font-family: 'Inter', 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--lx-text, #F5F7FB);
  line-height: 1.15;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 34px;
  }
`;

export const EyebrowBadge = styled.span`
  font-family: 'Inter', 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--lx-text-dim, #66728A);
  display: inline-block;
  margin-bottom: 6px;
`;

export const GradientText = styled.span`
  background: linear-gradient(to right, #34D399, #10B981);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const OnChainDataText = styled.span`
  font-family: monospace;
  font-size: 14px;
  color: #EDEDED;
`;
