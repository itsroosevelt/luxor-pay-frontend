'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/lib/merchants-api';
import { toast } from 'sonner';
import { Wallet, ArrowUpRight } from 'lucide-react';

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('');
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
        <p className="text-gray-400 text-sm">Business profile settings.</p>
      </header>

      <div className="p-6 md:p-10 max-w-xl space-y-6">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : (
          <>
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
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </form>

            <div className="glass-panel p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-[#60A5FA] shrink-0">
                <Wallet size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-light text-white">Wallets moved to Treasury</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your receiving wallet is now your Genesis wallet, managed in the Treasury tab.
                  There you can view balances, add more wallets and rename them.
                </p>
                <Link
                  href="/dashboard/treasury"
                  className="inline-flex items-center gap-0.5 text-xs text-[#60A5FA] hover:underline pt-1"
                >
                  Go to Treasury <ArrowUpRight size={12} />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
