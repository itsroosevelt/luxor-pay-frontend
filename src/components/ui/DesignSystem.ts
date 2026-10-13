"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

export const GlassCard = styled(motion.div)<{ $variant?: "default" | "hero" }>`
  background: transparent;
  border: none;
  border-radius: 0;
  backdrop-filter: none;
  box-shadow: none;
  padding: 0;
  position: relative;
  overflow: hidden;
  width: 100%;
`;

export const ButtonBase = styled.button<{ $variant?: "primary" | "secondary" | "glass" }>`
  font-family: var(--font-sans, 'Outfit', sans-serif);
  font-size: 13px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 9px 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #FFFFFF, 0 0 12px rgba(255, 255, 255, 0.4);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Primary — Monochrome solid white pill */
  ${({ $variant }) =>
    ($variant === "primary" || !$variant) &&
    `
    background: #FFFFFF;
    color: #000000;
    box-shadow: none;
    &:hover:not(:disabled) {
      background: #EDEDED;
      color: #000000;
      transform: translateY(-1px);
    }
  `}

  /* Secondary — Outlined glass pill */
  ${({ $variant }) =>
    $variant === "secondary" &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.15);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.10);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
  `}

  /* Glass — Neutral translucent pill fill */
  ${({ $variant }) =>
    $variant === "glass" &&
    `
    background: rgba(255, 255, 255, 0.08);
    color: #FFFFFF;
    border: 1px solid rgba(255, 255, 255, 0.2);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.14);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.35);
      transform: translateY(-1px);
    }
  `}
`;

export const HeroTitle = styled.h1`
  font-family: var(--font-sans, 'Outfit', sans-serif);
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #FFFFFF;
  line-height: 1.15;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 30px;
  }
`;

export const EyebrowBadge = styled.span`
  font-family: var(--font-sans, 'Outfit', sans-serif);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  display: inline-block;
  margin-bottom: 6px;
`;

export const GradientText = styled.span`
  color: #FFFFFF;
  -webkit-text-fill-color: #FFFFFF;
  font-weight: 500;
`;

export const OnChainDataText = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: #F1F5F9;
`;
