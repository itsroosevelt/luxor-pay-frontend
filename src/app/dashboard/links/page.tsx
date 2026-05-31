'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createPaymentLink, listPaymentLinks } from '@/lib/firestore-data';
import type { PaymentLink, Currency } from '@luxor/contracts';
import { Copy, Link as LinkIcon, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USDC');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const data = await listPaymentLinks(user.uid);
        setLinks(data);
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

    const parsed = parseFloat(amount);
    if (!name.trim() || Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Enter a valid name and amount');
      return;
    }

    setCreating(true);
    try {
      const link = await createPaymentLink(user.uid, {
        name: name.trim(),
        amount: parsed,
        currency,
      });
      setLinks((prev) => [link, ...prev]);
      setName('');
      setAmount('');
      toast.success('Payment link created');
    } catch (err) {
      if (err instanceof Error && err.message === 'MERCHANT_WALLET_REQUIRED') {
        toast.error('Add your Solana wallet in Settings first');
      } else {
        toast.error('Could not create link. Check Firestore rules.');
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
      <header className="p-6 md:p-10 border-b border-white/5">
        <h1 className="text-2xl font-bold mb-1">Payment Links</h1>
        <p className="text-gray-400 text-sm">Checkout URLs for your website, email, or social.</p>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        <form onSubmit={handleCreate} className="glass-panel p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Plus size={18} className="text-primary" /> New link
          </h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product or service name"
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
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
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <LinkIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{link.name}</h3>
                    <p className="text-sm text-gray-400">
                      {link.amount} {link.currency} · /pay/link/{link.id}
                    </p>
                  </div>
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
                    onClick={() => router.push(`/pay/link/${link.id}`)}
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
    </>
  );
}
