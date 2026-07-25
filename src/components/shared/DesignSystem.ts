"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

export const GlassCard = styled(motion.div)<{ $variant?: "default" | "hero" }>`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(40px);
  border-radius: 32px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
  padding: 28px;
  position: relative;
  overflow: hidden;
  width: 100%;
`;

export const ButtonBase = styled.button<{ $variant?: "primary" | "secondary" | "glass" }>`
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  border-radius: 9999px;
  padding: 12px 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: none;
  white-space: nowrap;

  &:focus-visible {
    outline: 2px solid #60A5FA;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  ${({ $variant }) =>
    ($variant === "primary" || !$variant) &&
    `
    background: #FFFFFF;
    color: #000000;
    &:hover:not(:disabled) {
      background: #2563EB;
      color: #FFFFFF;
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
    }
  `}

  ${({ $variant }) =>
    $variant === "secondary" &&
    `
    background: transparent;
    color: #60A5FA;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    &:hover:not(:disabled) {
      background: rgba(96, 165, 250, 0.1);
      border-color: #60A5FA;
      color: #FFFFFF;
    }
  `}

  ${({ $variant }) =>
    $variant === "glass" &&
    `
    background: rgba(255, 255, 255, 0.05);
    color: #EDEDED;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }
  `}
`;

export const HeroTitle = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 36px;
  font-weight: 500;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  line-height: 1.1;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 54px;
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
  -webkit-text-fill-color: transparent;
`;

export const OnChainDataText = styled.span`
  font-family: monospace;
  font-size: 14px;
  color: #EDEDED;
`;
