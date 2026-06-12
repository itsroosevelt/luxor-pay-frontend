'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowLeft, Copy, Download } from 'lucide-react';
import type { Currency } from '@luxor/contracts';
import { QRCodePayment } from '@/features/checkout/components/QRCodePayment';
import { buildSolanaPayUrl } from '@/lib/solana-pay-url';
import { toast } from 'sonner';

export function SolanaPayQrGenerator({
  merchantWallet,
  merchantName = 'Luxor Pay',
}: {
  merchantWallet: string;
  merchantName?: string;
}) {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDC');
  const [label, setLabel] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchantWallet.trim()) {
      toast.error('Add your Solana wallet in Settings before generating QR codes');
      return;
    }

    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    const url = buildSolanaPayUrl({
      recipient: merchantWallet,
      amount: parsed,
      currency,
      label: label.trim() || merchantName,
      message: label.trim() || undefined,
    });

    setGeneratedUrl(url);
  };

  const handleCopyUrl = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Solana Pay URL copied');
    } catch {
      toast.error('Could not copy URL');
    }
  };

  const handleDownloadQr = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !generatedUrl) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.download = 'solana-pay-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--dash-panel)]">
      <div className="px-4 md:px-6 py-4 border-b border-[var(--dash-border)] flex items-center gap-3">
        <Link
          href="/dashboard/payments"
          className="p-2 rounded-lg hover:bg-[var(--dash-surface-elevated)] text-[var(--dash-muted)] shrink-0"
          aria-label="Back to payments"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[var(--dash-text)]">Solana Pay QR</h1>
          <p className="text-xs text-[var(--dash-muted)] mt-0.5">
            Generate a QR code for display, print, or POS screens — no hosted checkout page.
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleGenerate} className="dash-card p-6 space-y-5">
            <div>
              <label htmlFor="qr-amount" className="block text-sm font-medium mb-2">
                Amount
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  id="qr-amount"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="dash-input px-4 py-2.5 text-sm"
                  required
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="dash-input px-4 py-2.5 text-sm"
                >
                  <option value="USDC">USDC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="qr-label" className="block text-sm font-medium mb-2">
                Label / description
              </label>
              <input
                id="qr-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Counter sale, table 4, etc."
                className="dash-input w-full px-4 py-2.5 text-sm"
              />
              <p className="text-xs text-[var(--dash-muted)] mt-1.5">
                Shown in the payer&apos;s wallet when they scan the QR.
              </p>
            </div>

            {!merchantWallet.trim() && (
              <p className="text-sm text-amber-400/90">
                Add your merchant wallet in{' '}
                <Link href="/dashboard/settings" className="text-[var(--dash-accent)] hover:underline">
                  Settings
                </Link>{' '}
                to generate QR codes.
              </p>
            )}

            <button
              type="submit"
              disabled={!merchantWallet.trim()}
              className="dash-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
            >
              Generate QR
            </button>
          </form>

          <div className="dash-card p-6 flex flex-col items-center">
            {generatedUrl ? (
              <>
                <div ref={qrRef} className="w-full flex justify-center">
                  <QRCodePayment url={generatedUrl} size={280} />
                </div>
                <div className="mt-4 w-full space-y-3">
                  <div className="rounded-lg bg-[var(--dash-surface-elevated)] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--dash-muted)] mb-1">
                      Solana Pay URL
                    </p>
                    <p className="text-xs font-mono text-[var(--dash-text)] break-all leading-relaxed">
                      {generatedUrl}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleCopyUrl()}
                      className="dash-btn-secondary flex-1 min-w-[140px] py-2 text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Copy size={14} />
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="dash-btn-secondary flex-1 min-w-[140px] py-2 text-sm inline-flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      Download QR
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-16 text-center text-sm text-[var(--dash-muted)] max-w-xs">
                Enter an amount and click Generate QR to display a scannable Solana Pay code.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
