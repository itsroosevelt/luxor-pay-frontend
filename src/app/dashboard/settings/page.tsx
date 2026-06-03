'use client';

import { useCallback, useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/lib/firestore-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';
import { PageHeader, SolanaWalletConnect, WalletBanner } from '@/components/dashboard';
import { Wallet, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profile = await getMerchantProfile(user.uid);
        if (profile) {
          setBusinessName(profile.businessName ?? '');
          setMerchantWallet(profile.merchantWallet ?? '');
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleWalletConnect = useCallback((address: string | null) => {
    if (address) setMerchantWallet(address);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const wallet = merchantWallet.trim();
    if (wallet && wallet.length < 32) {
      toast.error('Enter a valid Solana wallet address');
      return;
    }

    setSaving(true);
    try {
      await updateMerchantProfile(user.uid, {
        businessName: businessName.trim() || undefined,
        merchantWallet: wallet || undefined,
      });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Business profile and Solana wallet for receiving SOL and USDC payments."
      />

      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        {!loading && (
          <WalletBanner
            connected={Boolean(merchantWallet)}
            walletAddress={merchantWallet || undefined}
          />
        )}

        {loading ? (
          <p className="text-sm text-[var(--dash-muted)]">Loading…</p>
        ) : (
          <>
            <section className="dash-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-[var(--dash-accent)]" />
                <h2 className="font-semibold text-[var(--dash-text)]">Solana wallet</h2>
              </div>
              <p className="text-sm text-[var(--dash-muted)]">
                Connect a wallet or paste your pubkey manually. This address receives settlements
                from payment links, QR checkout, and POS charges.
              </p>
              <SolanaWalletConnect onAddressChange={handleWalletConnect} />
              <div>
                <label className="text-sm font-medium text-[var(--dash-text)] block mb-1.5">
                  Merchant wallet address
                </label>
                <input
                  value={merchantWallet}
                  onChange={(e) => setMerchantWallet(e.target.value)}
                  className="dash-input w-full px-4 py-2.5 text-sm font-mono"
                  placeholder="Your Solana pubkey (SOL / USDC)"
                />
              </div>
            </section>

            <form onSubmit={handleSave} className="dash-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-[var(--dash-accent)]" />
                <h2 className="font-semibold text-[var(--dash-text)]">Business profile</h2>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--dash-text)] block mb-1.5">
                  Business name
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="dash-input w-full px-4 py-2.5 text-sm"
                  placeholder="My Store"
                />
                <p className="text-xs text-[var(--dash-muted)] mt-1">
                  Shown in the dashboard sidebar and checkout pages.
                </p>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save settings'}
              </button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
