"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

export const GlassCard = styled(motion.div)<{ $variant?: "default" | "hero" }>`
  background: var(--lx-surface, #17181E);
  border: 1px solid var(--lx-border, rgba(255, 255, 255, 0.08));
  border-radius: var(--lx-radius, 12px);
  box-shadow: none;
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
    box-shadow: var(--lx-ring, 0 0 0 3px rgba(255, 255, 255, 0.14));
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Primary — high-contrast white with near-black label (Squads "Send"). */
  ${({ $variant }) =>
    ($variant === "primary" || !$variant) &&
    `
    background: var(--lx-primary, #FFFFFF);
    color: var(--lx-primary-text, #0F1015);
    &:hover:not(:disabled) {
      background: var(--lx-primary-hover, #E2E8F0);
    }
  `}

  /* Secondary — outlined, neutral. */
  ${({ $variant }) =>
    $variant === "secondary" &&
    `
    background: var(--lx-fill, rgba(255,255,255,0.05));
    color: var(--lx-text-muted, #8A8F9E);
    border: 1px solid var(--lx-border-strong, rgba(255,255,255,0.12));
    &:hover:not(:disabled) {
      background: var(--lx-fill-hover, rgba(255,255,255,0.10));
      color: var(--lx-text, #F1F5F9);
      border-color: var(--lx-border-hover, rgba(255,255,255,0.18));
    }
  `}

  /* Glass — subtle translucent fill. */
  ${({ $variant }) =>
    $variant === "glass" &&
    `
    background: var(--lx-fill, rgba(255,255,255,0.05));
    color: var(--lx-text-muted, #8A8F9E);
    border: 1px solid var(--lx-border, rgba(255,255,255,0.08));
    &:hover:not(:disabled) {
      background: var(--lx-fill-hover, rgba(255,255,255,0.10));
      color: var(--lx-text, #F1F5F9);
      border-color: var(--lx-border-hover, rgba(255,255,255,0.18));
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

/** Retained for API compatibility — now a flat neutral, no gradient. */
export const GradientText = styled.span`
  color: var(--lx-text, #F1F5F9);
`;

export const OnChainDataText = styled.span`
  font-family: monospace;
  font-size: 14px;
  color: var(--lx-text, #F1F5F9);
`;
