'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/lib/firestore-data';
import { toast } from 'sonner';

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      await updateMerchantProfile(user.uid, {
        businessName: businessName.trim() || undefined,
        merchantWallet: merchantWallet.trim() || undefined,
      });
      toast.success('Profile saved');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-gray-400 text-sm">Business profile and Solana wallet for receiving payments.</p>
      </header>

      <div className="p-6 md:p-10 max-w-xl">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="glass-panel p-6 space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Business name</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
                placeholder="My Store"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Solana wallet address</label>
              <input
                value={merchantWallet}
                onChange={(e) => setMerchantWallet(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono"
                placeholder="Your pubkey for USDC / SOL"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used on payment links, QR codes, and POS charges.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
