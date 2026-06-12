'use client';

import { useCallback, useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { ensureMerchantProfile, getMerchantProfile, updateMerchantProfile } from '@/lib/merchant-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';
import { SolanaWalletConnect, WalletBanner } from '@/components/dashboard';
import { SettingsSection } from './SettingsSection';
import { Building2, Wallet } from 'lucide-react';

export function MerchantWalletSection() {
  const [businessName, setBusinessName] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        await ensureMerchantProfile(user.uid, user.email ?? '');
        const profile = await getMerchantProfile(user.uid);
        if (profile) {
          setBusinessName(profile.businessName ?? '');
          setMerchantWallet(profile.merchantWallet ?? '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setHydrated(true);
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
      await ensureMerchantProfile(user.uid, user.email ?? '');
      await updateMerchantProfile(user.uid, {
        businessName: businessName.trim() || undefined,
        merchantWallet: wallet || undefined,
      });
      toast.success('Merchant profile saved');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'Could not save profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Merchant and Solana wallet"
      description="Business profile and address to receive SOL and USDC payments."
    >
      {!hydrated ? (
        <div className="px-5 py-4">
          <p className="text-sm text-[var(--dash-muted)]">Loading profile…</p>
        </div>
      ) : (
        <>
          <div className="px-5 py-4 border-b border-[var(--dash-border)]">
            <WalletBanner
              connected={Boolean(merchantWallet)}
              walletAddress={merchantWallet || undefined}
            />
          </div>

          <div className="px-5 py-4 border-b border-[var(--dash-border)] space-y-4">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[var(--dash-accent)]" />
              <h3 className="text-sm font-semibold text-[var(--dash-text)]">Wallet Solana</h3>
            </div>
            <p className="text-sm text-[var(--dash-muted)]">
              Connect a wallet or paste your public key manually. This address receives settlements from payment links, QR checkout, and POS charges.
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
                placeholder="Tu pubkey Solana (SOL / USDC)"
              />
            </div>
          </div>

          <form onSubmit={handleSave} className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[var(--dash-accent)]" />
              <h3 className="text-sm font-semibold text-[var(--dash-text)]">Business profile</h3>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--dash-text)] block mb-1.5">
                Business name
              </label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="dash-input w-full px-4 py-2.5 text-sm"
                placeholder="Mi tienda"
              />
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                Shown in the dashboard sidebar and on checkout pages.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </>
      )}
    </SettingsSection>
  );
}
