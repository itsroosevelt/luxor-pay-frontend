"use client";

import React, { useState } from "react";
import styled from "styled-components";

const IconContainer = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
`;

const StyledImg = styled.img<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  object-fit: cover;
  border-radius: 9999px;
`;

interface TokenIconProps {
  symbol: string;
  size?: number;
  logoUrl?: string | null;
}

const REMOTE_TOKEN_MAP: Record<string, string> = {
  SOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  WSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  USDC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  USDT: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
};

export function TokenIcon({ symbol, size = 22, logoUrl }: TokenIconProps) {
  const [imgError, setImgError] = useState(false);
  const sym = (symbol || "").toUpperCase();

  const targetUrl = logoUrl || REMOTE_TOKEN_MAP[sym];

  if (targetUrl && !imgError) {
    return (
      <IconContainer $size={size} className="notranslate" translate="no">
        <StyledImg
          src={targetUrl}
          alt={sym}
          $size={size}
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </IconContainer>
    );
  }

  // Fallback gradient badge if remote URL fails or doesn't exist
  return (
    <IconContainer $size={size} className="notranslate" translate="no">
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "9999px",
          background: "linear-gradient(135deg, #60A5FA, #2563EB)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          fontFamily: "Outfit, sans-serif",
          fontSize: `${Math.round(size * 0.42)}px`,
          fontWeight: 700,
        }}
      >
        {sym.slice(0, 2)}
      </div>
    </IconContainer>
  );
}
