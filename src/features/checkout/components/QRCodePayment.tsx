'use client';

import { QRCodeSVG } from 'qrcode.react';

export function QRCodePayment({
  url,
  size = 220,
}: {
  url: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl">
      <QRCodeSVG value={url} size={size} bgColor="#ffffff" fgColor="#000000" level="M" />
      <p className="mt-4 text-xs text-black font-semibold text-center">
        Escanea con Phantom, Solflare u otra wallet de Solana
      </p>
    </div>
  );
}
