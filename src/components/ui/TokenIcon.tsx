"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { TokenIcon as VectorTokenIcon } from "@/components/ui/VectorTokenIcon";

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
  mint?: string | null;
}

/** Official Solana & Jupiter CDN Token Logos */
const REMOTE_TOKEN_MAP: Record<string, string> = {
  SOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  WSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  USDC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  EURC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr/logo.png",
  EUR: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr/logo.png",
  USDT: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png",
  BONK: "https://arweave.net/hQiWwqad6Rsc5jWdZBG-krjgtnzrIOs_y5IWQUPqYA4",
  JUP: "https://static.jup.ag/jup/icon.png",
  PYTH: "https://pyth.network/token-logo.png",
  RAY: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png",
  BSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/bSo13r4TkiE4KumLrvvhMRexf1vNWDJhD5sn4uGXkWX/logo.png",
  MSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png",
  JITOSOL: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn/logo.png",
  WBTC: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png",
  ETH: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
  WETH: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png",
};

/** In-memory cache for dynamic Jupiter API fetched token logos */
const jupiterLogoCache: Record<string, string> = {};

export function TokenIcon({ symbol, size = 22, logoUrl, mint }: TokenIconProps) {
  const [imgError, setImgError] = useState(false);
  const [dynamicUrl, setDynamicUrl] = useState<string | null>(null);
  const sym = (symbol || "").toUpperCase();

  const knownUrl = logoUrl || REMOTE_TOKEN_MAP[sym];

  // If token is unknown, try fetching metadata from Jupiter API
  useEffect(() => {
    if (knownUrl || !mint || jupiterLogoCache[mint]) {
      if (mint && jupiterLogoCache[mint]) setDynamicUrl(jupiterLogoCache[mint]);
      return;
    }
    let isMounted = true;
    fetch(`https://tokens.jup.ag/token/${mint}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.logoURI) {
          jupiterLogoCache[mint] = data.logoURI;
          setDynamicUrl(data.logoURI);
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, [knownUrl, mint]);

  const targetUrl = knownUrl || dynamicUrl;

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

  // Render high-definition vector SVG token icon
  return <VectorTokenIcon symbol={sym} size={size} />;
}
