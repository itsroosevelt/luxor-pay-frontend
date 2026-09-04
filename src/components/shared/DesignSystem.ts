"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

export const GlassCard = styled(motion.div)<{ $variant?: "default" | "hero" }>`
  background: ${({ $variant }) =>
    $variant === "hero"
      ? "linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(13, 15, 22, 0.95))"
      : "rgba(18, 20, 28, 0.8)"};
  border: 1px solid
    ${({ $variant }) =>
      $variant === "hero"
        ? "rgba(96, 165, 250, 0.28)"
        : "rgba(255, 255, 255, 0.12)"};
  border-radius: 24px;
  backdrop-filter: blur(24px);
  box-shadow: ${({ $variant }) =>
    $variant === "hero"
      ? "0 24px 60px -16px rgba(0, 0, 0, 0.85), 0 0 35px rgba(37, 99, 235, 0.18)"
      : "0 16px 40px -12px rgba(0, 0, 0, 0.7)"};
  padding: var(--lx-pad, 24px);
  position: relative;
  overflow: hidden;
  width: 100%;
`;

export const ButtonBase = styled.button<{ $variant?: "primary" | "secondary" | "glass" }>`
  font-family: 'Outfit', sans-serif;
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
    box-shadow: 0 0 0 2px #60A5FA, 0 0 12px rgba(96, 165, 250, 0.4);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Primary — Official Luxor Electric Blue Gradient */
  ${({ $variant }) =>
    ($variant === "primary" || !$variant) &&
    `
    background: linear-gradient(135deg, #60A5FA, #2563EB);
    color: #FFFFFF;
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.5);
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
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.10);
      color: #FFFFFF;
      border-color: rgba(96, 165, 250, 0.4);
      transform: translateY(-1px);
    }
  `}

  /* Glass — Translucent pill fill */
  ${({ $variant }) =>
    $variant === "glass" &&
    `
    background: rgba(96, 165, 250, 0.1);
    color: #60A5FA;
    border: 1px solid rgba(96, 165, 250, 0.25);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(96, 165, 250, 0.18);
      color: #FFFFFF;
      border-color: rgba(96, 165, 250, 0.45);
      transform: translateY(-1px);
    }
  `}
`;

export const HeroTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
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
  font-family: 'Outfit', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: #60A5FA;
  display: inline-block;
  margin-bottom: 6px;
`;

export const GradientText = styled.span`
  background: linear-gradient(to right, #60A5FA, #2563EB);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 500;
`;

export const OnChainDataText = styled.span`
  font-family: monospace;
  font-size: 13px;
  color: #F1F5F9;
`;
