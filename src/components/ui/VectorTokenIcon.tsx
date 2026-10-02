import React from 'react';

export type TokenSymbol = 'SOL' | 'USDC' | 'EURC' | 'USDT' | 'LXR' | 'LUXOR' | string;

interface TokenIconProps {
  symbol: TokenSymbol;
  size?: number;
  className?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({ symbol, size = 20, className = '' }) => {
  const sym = symbol?.toUpperCase() || 'SOL';

  if (sym === 'SOL') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <circle cx="64" cy="64" r="64" fill="#0A0A10" />
        <defs>
          <linearGradient id="sol-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="sol-g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="sol-g3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="100%" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
        <path
          d="M34.5 41.5h59a1.5 1.5 0 001.06-2.56L82.16 26.56a1.5 1.5 0 00-1.06-.44h-59a1.5 1.5 0 00-1.06 2.56l12.4 12.38a1.5 1.5 0 001.06.44z"
          fill="url(#sol-g1)"
        />
        <path
          d="M93.5 57.5h-59a1.5 1.5 0 00-1.06 2.56l12.4 12.38a1.5 1.5 0 001.06.44h59a1.5 1.5 0 001.06-2.56l-12.4-12.38a1.5 1.5 0 00-1.06-.44z"
          fill="url(#sol-g2)"
        />
        <path
          d="M34.5 101.5h59a1.5 1.5 0 001.06-2.56l-12.4-12.38a1.5 1.5 0 00-1.06-.44h-59a1.5 1.5 0 00-1.06 2.56l12.4 12.38a1.5 1.5 0 001.06.44z"
          fill="url(#sol-g3)"
        />
      </svg>
    );
  }

  if (sym === 'USDC') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 2000 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <circle cx="1000" cy="1000" r="1000" fill="#2775CA" />
        <path
          d="M1275 1160c0-128-76-173-228-197-104-17-128-40-128-87 0-48 40-77 108-77 62 0 102 23 118 73 4 12 14 20 27 20h71c16 0 28-13 27-29-19-106-96-171-209-183v-105c0-15-12-27-27-27h-69c-15 0-27 12-27 27v103c-124 16-200 95-200 204 0 126 77 172 227 197 111 19 129 44 129 88 0 54-47 84-120 84-88 0-125-36-138-89-3-13-14-22-28-22h-74c-16 0-28 13-27 29 17 116 88 183 227 198v105c0 15 12 27 27 27h69c15 0 27-12 27-27v-105c128-17 207-95 207-210z"
          fill="#FFFFFF"
        />
        <path
          d="M784 1530c-293-104-450-422-346-715 67-189 224-328 418-368 15-3 25-16 25-31v-64c0-18-16-32-34-29-346 60-580 390-520 736 51 294 290 523 585 562 18 2 34-12 34-30v-64c0-15-11-28-26-31-48-9-94-22-136-37z"
          fill="#FFFFFF"
          opacity="0.4"
        />
        <path
          d="M1216 470c293 104 450 422 346 715-67 189-224 328-418 368-15 3-25 16-25 31v64c0 18 16 32 34 29 346-60 580-390 520-736-51-294-290-523-585-562-18-2-34 12-34 30v64c0 15 11 28 26 31 48 9 94 22 136 37z"
          fill="#FFFFFF"
          opacity="0.4"
        />
      </svg>
    );
  }

  if (sym === 'EURC') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 2000 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <circle cx="1000" cy="1000" r="1000" fill="#1A56B8" />
        <text
          x="1000"
          y="1240"
          fontFamily="Outfit, sans-serif"
          fontSize="1100"
          fontWeight="bold"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          €
        </text>
      </svg>
    );
  }

  if (sym === 'USDT') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 2000 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <circle cx="1000" cy="1000" r="1000" fill="#26A17B" />
        <path d="M1400 600H600v200h300v700h200V800h300V600z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (sym === 'LXR' || sym === 'LUXOR') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 2000 2000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ flexShrink: 0 }}
      >
        <circle cx="1000" cy="1000" r="1000" fill="url(#lxr-grad)" />
        <defs>
          <linearGradient id="lxr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <polygon points="1000,450 1550,1450 450,1450" fill="none" stroke="#FFFFFF" strokeWidth="110" strokeLinejoin="round" />
        <polygon points="1000,750 1280,1250 720,1250" fill="#FFFFFF" />
      </svg>
    );
  }

  // Fallback icon: styled gradient circle with initial letter
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #60A5FA, #2563EB)',
        color: '#FFFFFF',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.52,
        fontWeight: 'bold',
        fontFamily: 'Outfit, sans-serif',
        flexShrink: 0,
      }}
      className={className}
    >
      {sym.charAt(0)}
    </div>
  );
};
