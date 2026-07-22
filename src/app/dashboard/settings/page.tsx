'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/lib/merchants-api';
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
        const token = await user.getIdToken();
        const profile = await getMerchantProfile(token);
        
        if (profile) {
          setBusinessName(profile.businessName ?? '');
          setMerchantWallet(profile.merchantWallet ?? '');
        }
      } catch {
        // Silently handle get profile failure
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
      const token = await user.getIdToken();
      await updateMerchantProfile(token, {
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
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Settings</h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>Business profile and Solana wallet for receiving payments.</p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto">
        {loading ? (
          <p className="text-gray-500 text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading…</p>
        ) : (
          <form onSubmit={handleSave} className="glass-panel p-6 space-y-4 max-w-2xl">
            <div>
              <label className="text-sm text-gray-400 block mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Business name</label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
                placeholder="My Store"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Solana wallet address</label>
              <input
                value={merchantWallet}
                onChange={(e) => setMerchantWallet(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono"
                placeholder="Your pubkey for USDC / SOL"
              />
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Used on payment links, QR codes, and POS charges.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-white text-black font-medium text-sm rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 shadow-md focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
