'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getMerchantProfile, updateMerchantProfile } from '@/features/merchant/api/merchants-api';
import { createPosDevice, listPosDevices } from '@/features/payments/api/payments-api';
import { authHeaders } from '@/lib/auth-client';
import { apiUrl, getApiBaseUrl } from '@/lib/api-client';
import type { PosDevice } from '@luxor/contracts';
import { useMerchant } from '@/features/merchant/context/MerchantContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { useMembers } from '@/features/treasury/hooks/useMembers';
import { Settings, Terminal, Code2, Plus, Key, Trash2, Copy, ShieldCheck, Minus } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState<'general' | 'pos' | 'developers'>(
    initialTab === 'pos' || initialTab === 'developers' ? initialTab : 'general'
  );

  const { profile: currentProfile, setProfile } = useMerchant();
  const wallet = useWallet();
  const { config: treasuryConfig, isLoading: cfgLoading, setThreshold } = useTreasury();
  const { data: members = [] } = useMembers();

  const signerCount = members.filter((m) => m.roles?.signer).length || 1;
  const threshold = treasuryConfig?.threshold ?? 1;

  const short = (a: string) => (a.length > 14 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a);

  const changeThreshold = async (next: number) => {
    if (next < 1 || next > Math.max(1, signerCount)) return;
    try {
      await setThreshold(next);
      toast.success(`Signature threshold updated: ${next} of ${signerCount}`);
    } catch {
      toast.error('Could not update threshold');
    }
  };

  // General state
  const [businessName, setBusinessName] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // POS Devices state
  const [devices, setDevices] = useState<PosDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [posName, setPosName] = useState('');
  const [posId, setPosId] = useState('');
  const [creatingPos, setCreatingPos] = useState(false);

  // Developers state
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [keyName, setKeyName] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [adminMissing, setAdminMissing] = useState(false);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'pos' || tabFromUrl === 'developers' || tabFromUrl === 'general') {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'general' | 'pos' | 'developers') => {
    setActiveTab(tab);
    router.replace(`/dashboard/settings?tab=${tab}`);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const profile = await getMerchantProfile();
        if (profile) {
          setProfile(profile);
          setBusinessName(profile.businessName ?? '');
          setMerchantWallet(profile.merchantWallet ?? '');
        }
      } catch {
        // Handle silently
      } finally {
        setLoadingProfile(false);
      }

      // Load POS devices
      try {
        setDevices(await listPosDevices());
      } catch {
        // Handle silently
      } finally {
        setLoadingDevices(false);
      }
    });
    return () => unsubscribe();
  }, [setProfile]);

  // Load API Keys for Developers tab
  const loadKeys = async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/api-keys'), { headers: await authHeaders() });
      if (res.status === 503) {
        setAdminMissing(true);
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setKeys(json.data ?? []);
    } catch {
      // Handle silently
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSavingProfile(true);
    try {
      const nextWallet = merchantWallet.trim();
      // Changing the receiving wallet needs a member wallet signature (asked only in that case).
      const walletChanged = !!nextWallet && nextWallet !== (currentProfile?.merchantWallet ?? '');
      const updated = await updateMerchantProfile(
        {
          businessName: businessName.trim() || undefined,
          merchantWallet: nextWallet || undefined,
        },
        walletChanged ? wallet : undefined,
      );

      setProfile(updated);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreatePos = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !posName.trim() || !posId.trim()) {
      toast.error('Name and POS ID are required');
      return;
    }

    setCreatingPos(true);
    try {
      const device = await createPosDevice({
        name: posName.trim(),
        posId: posId.trim(),
      });
      setDevices((prev) => [device, ...prev]);
      setPosName('');
      setPosId('');
      toast.success('POS device registered');
    } catch {
      toast.error('Could not register device');
    } finally {
      setCreatingPos(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    try {
      const res = await fetch(apiUrl('/api/v1/api-keys'), {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ name: keyName.trim() }),
      });
      if (res.status === 503) {
        setAdminMissing(true);
        toast.error('Configure Firebase Admin to use API keys');
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setNewSecret(json.secret);
      setKeyName('');
      await loadKeys();
      toast.success('API key created — copy it now');
    } catch {
      toast.error('Could not create API key');
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/api-keys/${id}`), {
        method: 'DELETE',
        headers: await authHeaders(),
      });
      if (!res.ok) throw new Error();
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success('API key revoked');
    } catch {
      toast.error('Could not revoke key');
    }
  };

  const apiBase = getApiBaseUrl();

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Settings</h1>
          <p className="lx-page-subtitle">
            Manage your account preferences, POS terminals, and developer API keys.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('general')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Settings size={15} /> General
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pos')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'pos'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Terminal size={15} /> POS Devices
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('developers')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'developers'
                ? 'bg-white text-black shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Code2 size={15} /> Developers & API
          </button>
        </div>

        {/* Tab 1: General Settings */}
        {activeTab === 'general' && (
          <div>
            {loadingProfile ? (
              <p className="text-gray-500 text-sm">Loading profile…</p>
            ) : (
              <form onSubmit={handleSaveProfile} className="glass-panel p-6 space-y-4 max-w-2xl">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1.5">
                    Business Name
                  </label>
                  <input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E2E8F0] outline-none"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-400 block mb-1.5">
                    Solana Wallet Address
                  </label>
                  <input
                    value={merchantWallet}
                    onChange={(e) => setMerchantWallet(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-[#E2E8F0] outline-none"
                    placeholder="Your pubkey for USDC / SOL"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Used on payment links, QR codes, and POS charges.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-white text-black font-medium text-xs rounded-full hover:bg-neutral-200 transition-all disabled:opacity-50 shadow-md"
                >
                  {savingProfile ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* Signing Policy Multisig */}
            <div className="mt-8 pt-6 border-t border-white/10 max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-white/70" />
                <h3 className="text-sm font-semibold text-white">Signing Policy (Multisig)</h3>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-neutral-400">Active Threshold</p>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    {cfgLoading ? '—' : `${threshold} of ${signerCount}`} signers required to execute
                  </p>
                  {treasuryConfig?.address && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(treasuryConfig.address);
                        toast.success('Multisig address copied');
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-neutral-400 hover:text-white transition-colors"
                      title="Copy multisig address"
                    >
                      {short(treasuryConfig.address)} <Copy size={11} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">M-of-N Threshold</span>
                  <div className="flex items-center gap-1 rounded-full p-1 bg-white/5 border border-white/15">
                    <button
                      type="button"
                      aria-label="Decrease threshold"
                      disabled={threshold <= 1}
                      onClick={() => changeThreshold(threshold - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums text-white">{threshold}</span>
                    <button
                      type="button"
                      aria-label="Increase threshold"
                      disabled={threshold >= signerCount}
                      onClick={() => changeThreshold(threshold + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: POS Devices */}
        {activeTab === 'pos' && (
          <div className="space-y-6">
            <form onSubmit={handleCreatePos} className="glass-panel p-6 space-y-4">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <Plus size={18} className="text-[#E2E8F0]" /> Register POS Device
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  value={posName}
                  onChange={(e) => setPosName(e.target.value)}
                  placeholder="Store counter #1"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E2E8F0] outline-none"
                />
                <input
                  value={posId}
                  onChange={(e) => setPosId(e.target.value)}
                  placeholder="POS ID (serial or label)"
                  className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E2E8F0] outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={creatingPos}
                className="px-6 py-2.5 bg-white text-black font-medium text-xs rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 shadow-md focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                {creatingPos ? 'Saving…' : 'Register POS'}
              </button>
            </form>

            <div className="glass-panel p-6 text-xs text-gray-400 space-y-2 font-mono">
              <p className="text-white font-sans font-semibold mb-1">Charge Endpoint</p>
              <p>POST {apiBase}/api/v1/pos/charge</p>
              <p>Header: X-Api-Key: sk_live_…</p>
            </div>

            {loadingDevices ? (
              <p className="text-gray-500 text-sm">Loading devices…</p>
            ) : devices.length === 0 ? (
              <p className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl text-sm">
                No POS devices registered yet.
              </p>
            ) : (
              <div className="grid gap-4">
                {devices.map((d) => (
                  <div key={d.id} className="glass-panel p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-[#E2E8F0]">
                      <Terminal size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white text-sm">{d.name}</h3>
                      <p className="text-xs text-gray-400">
                        POS ID: <code className="text-[#E2E8F0] font-mono">{d.posId}</code>
                        {d.lastSeenAt ? ` · Last seen ${new Date(d.lastSeenAt).toLocaleString()}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Developers */}
        {activeTab === 'developers' && (
          <div className="space-y-6">
            {adminMissing && (
              <div className="glass-panel p-4 border border-amber-500/30 text-xs text-amber-200">
                Start the backend and set Firebase Admin in{' '}
                <code className="text-[#E2E8F0]">backend/.env</code>.
              </div>
            )}

            {newSecret && (
              <div className="glass-panel p-4 border border-[#E2E8F0]/40 space-y-2">
                <p className="text-xs font-semibold text-[#E2E8F0]">New secret key (shown once)</p>
                <code className="block text-xs break-all bg-black/50 p-3 rounded-lg font-mono text-white">{newSecret}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(newSecret);
                    toast.success('Copied');
                  }}
                  className="text-xs flex items-center gap-1.5 text-[#E2E8F0] hover:underline"
                >
                  <Copy size={13} /> Copy Key
                </button>
              </div>
            )}

            <form onSubmit={handleCreateKey} className="glass-panel p-6 flex flex-col sm:flex-row gap-3">
              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Key name (e.g. Production POS)"
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#E2E8F0] outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-black font-medium text-xs rounded-full flex items-center justify-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all shadow-md"
              >
                <Plus size={15} /> Create Key
              </button>
            </form>

            <div className="glass-panel p-6 font-mono text-xs text-gray-400 space-y-2">
              <p className="text-white font-sans font-semibold text-sm">Base URL</p>
              <p>{apiBase}/api/v1</p>
              <p className="pt-2 text-white font-sans font-semibold text-sm">Endpoints</p>
              <p>GET /payment-links · POST /pos/charge · Header X-Api-Key</p>
            </div>

            {loadingKeys ? (
              <p className="text-gray-500 text-sm">Loading keys…</p>
            ) : keys.length === 0 ? (
              <p className="text-gray-500 text-sm">No API keys yet.</p>
            ) : (
              <div className="grid gap-3">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="glass-panel p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Key className="text-[#E2E8F0]" size={18} />
                      <div>
                        <p className="font-medium text-white text-sm">{k.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{k.keyPrefix}…</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeKey(k.id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      aria-label="Revoke key"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="p-10 text-gray-500 text-sm">Loading settings…</div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
