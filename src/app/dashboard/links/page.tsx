'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createPaymentLink, listPaymentLinks } from '@/lib/payments-api';
import { formatPaymentLinkAmount } from '@/lib/payment-link-utils';
import { getMerchantProfile } from '@/lib/merchants-api';
import type { PaymentLink, Currency } from '@luxor/contracts';
import { Copy, Plus, ExternalLink, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { TOKEN_REGISTRY } from '@/lib/token-registry';
import { getLuxorEnv } from '@/lib/luxor-env';
import { ReceiveModal } from '@/components/dashboard/overview/ReceiveModal';

export default function PaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [amount, setAmount] = useState('');
  const [amountOptional, setAmountOptional] = useState(false);
  const [currency, setCurrency] = useState<string>('USDC');
  const [creating, setCreating] = useState(false);
  const [merchantWallet, setMerchantWallet] = useState<string | null>(null);
  const [isOpenAmountQrOpen, setIsOpenAmountQrOpen] = useState(false);

  const env = getLuxorEnv();
  const isDev = env === 'development';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const data = await listPaymentLinks(token);
        setLinks(data);

        const profile = await getMerchantProfile(token);
        if (profile?.businessName) {
          setBusinessName(profile.businessName);
        }
        setMerchantWallet(profile?.merchantWallet ?? null);
      } catch {
        toast.error('Could not load links');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const parsed = amountOptional ? null : parseFloat(amount);
    if (!name.trim() || !businessName.trim()) {
      toast.error('Enter valid details for all fields');
      return;
    }
    if (!amountOptional && (Number.isNaN(parsed!) || parsed! <= 0)) {
      toast.error('Enter a valid amount or check Open amount');
      return;
    }

    setCreating(true);
    try {
      const token = await user.getIdToken();
      const link = await createPaymentLink(token, {
        name: name.trim(),
        businessName: businessName.trim(),
        ...(parsed != null ? { amount: parsed } : {}),
        currency,
      });
      setLinks((prev) => [link, ...prev]);
      setName('');
      setBusinessName('');
      setAmount('');
      setAmountOptional(false);
      toast.success('Payment link created');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not create link';
      if (msg === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Add your Solana wallet in Settings first');
      } else {
        toast.error(msg);
      }
    } finally {
      setCreating(false);
    }
  };

  const payLinkUrl = (id: string) => `${window.location.origin}/pay/link/${id}`;

  const copyUrl = (id: string) => {
    navigator.clipboard.writeText(payLinkUrl(id));
    toast.success('Link copied');
  };

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Payment Links</h1>
          <p className="text-gray-400 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Checkout URLs for your website, email, or social.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpenAmountQrOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-blue-400/30 text-blue-400 font-medium hover:bg-white/5 transition-colors"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <QrCode size={18} /> Open amount QR
        </button>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        <form onSubmit={handleCreate} className="glass-panel p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus size={18} className="text-primary" /> New link
          </h2>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product or service name"
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
            />
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
            />
            <div className="flex flex-col gap-2">
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                disabled={amountOptional}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={amountOptional}
                  onChange={(e) => {
                    setAmountOptional(e.target.checked);
                    if (e.target.checked) setAmount('');
                  }}
                  className="rounded border-white/20"
                />
                Open amount (payer enters amount at checkout)
              </label>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="SOL">Solana (SOL)</option>
              {isDev ? (
                <optgroup label="Devnet Tokens">
                  {Object.entries(TOKEN_REGISTRY['devnet']).map(([mint, symbol]) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <optgroup label="Mainnet Beta Tokens">
                  {Object.entries(TOKEN_REGISTRY['mainnet-beta']).map(([mint, symbol]) => (
                    <option key={symbol} value={symbol}>
                      {symbol}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create link'}
          </button>
        </form>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading links…</p>
        ) : links.length === 0 ? (
          <p className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
            No links yet. Create your first payment link above.
          </p>
        ) : (
          <div className="grid gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="glass-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-semibold">{link.name}</h3>
                  <p className="text-sm text-gray-400">
                    {formatPaymentLinkAmount(link)} · /pay/link/{link.id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => copyUrl(link.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm"
                  >
                    <Copy size={16} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/links/preview/${link.id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm border border-white/10"
                  >
                    <ExternalLink size={16} /> Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReceiveModal
        isOpen={isOpenAmountQrOpen}
        onClose={() => setIsOpenAmountQrOpen(false)}
        merchantWallet={merchantWallet}
        title="Open Amount QR"
        subtitle="The payer scans this code and enters the amount in their wallet app."
        showCreateLinkButton={false}
      />
    </>
  );
}
