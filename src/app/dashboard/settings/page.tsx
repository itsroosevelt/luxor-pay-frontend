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
import { useProposals } from '@/features/treasury/hooks/useProposals';
import { PendingChangeNotice } from '@/features/treasury/components/PendingChangeNotice';
import { findPendingThresholdProposal } from '@/features/treasury/lib/pending-config';
import {
  Settings as SettingsIcon,
  Terminal,
  Code2,
  Plus,
  Key,
  Trash2,
  Copy,
  Minus,
  Eye,
  EyeOff,
  ExternalLink,
  X,
  Loader2,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
}

interface SpendingLimit {
  id: string;
  amount: string;
  label: string;
  timeframe: string;
  destination: string;
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
  const { data: proposals = [] } = useProposals();
  // A threshold change waits for signatures on-chain: say so, and don't let a second one pile up.
  const pendingThreshold = findPendingThresholdProposal(proposals);

  const signerCount = members.filter((m) => m.roles?.signer).length || 1;
  const threshold = treasuryConfig?.threshold ?? 1;

  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [editableThreshold, setEditableThreshold] = useState<number>(threshold);
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    if (!isEditingThreshold) {
      setEditableThreshold(threshold);
    }
  }, [threshold, isEditingThreshold]);

  const handleStartEdit = () => {
    if (pendingThreshold) return;
    setEditableThreshold(threshold);
    setIsEditingThreshold(true);
  };

  const handleCancelEdit = () => {
    setEditableThreshold(threshold);
    setIsEditingThreshold(false);
  };

  const handleDecrementThreshold = () => {
    if (editableThreshold > 1) {
      setEditableThreshold((prev) => prev - 1);
    }
  };

  const handleIncrementThreshold = () => {
    if (editableThreshold < signerCount) {
      setEditableThreshold((prev) => prev + 1);
    }
  };

  const handleSaveThreshold = async () => {
    if (editableThreshold === threshold) {
      setIsEditingThreshold(false);
      return;
    }
    setSavingThreshold(true);
    try {
      const outcome = await setThreshold(editableThreshold);
      if (outcome && outcome.proposalIndex !== undefined && !outcome.executed) {
        toast.info(
          `Propuesta #${outcome.proposalIndex} de cambio de umbral creada. Al requerirse ${threshold} firmas, la propuesta está pendiente de aprobación en Treasury para ejecutarse.`,
          { duration: 7000 }
        );
      } else {
        toast.success(`Umbral de firmas actualizado: ${editableThreshold} de ${signerCount}`);
      }
      setIsEditingThreshold(false);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'No se pudo actualizar el umbral');
    } finally {
      setSavingThreshold(false);
    }
  };

  const short = (a: string) => (a.length > 14 ? `${a.slice(0, 5)}…${a.slice(-5)}` : a);

  // General profile state
  const [businessName, setBusinessName] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Security settings state
  const [maskMultisigAccount, setMaskMultisigAccount] = useState(true);
  const [privacyEnabled, setPrivacyEnabled] = useState(false);
  const [privacyLastChanged, setPrivacyLastChanged] = useState('3/3/2026');
  const [timelock, setTimelock] = useState('none');
  const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([
    {
      id: '1',
      amount: '1 SOL',
      label: 'Fee Relayer',
      timeframe: 'Daily',
      destination: 'Eann...XfmS',
    },
  ]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newLimitAmount, setNewLimitAmount] = useState('');
  const [newLimitLabel, setNewLimitLabel] = useState('');
  const [newLimitDest, setNewLimitDest] = useState('');

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
      const walletChanged = !!nextWallet && nextWallet !== (currentProfile?.merchantWallet ?? '');
      const updated = await updateMerchantProfile(
        {
          businessName: businessName.trim() || undefined,
          merchantWallet: nextWallet || undefined,
        },
        walletChanged ? wallet : undefined
      );

      setProfile(updated);
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : 'Could not save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSpendingLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLimitAmount.trim() || !newLimitLabel.trim()) {
      toast.error('Please enter amount and label');
      return;
    }
    const newLimit: SpendingLimit = {
      id: Date.now().toString(),
      amount: newLimitAmount.trim(),
      label: newLimitLabel.trim(),
      timeframe: 'Daily',
      destination: newLimitDest.trim() ? short(newLimitDest.trim()) : 'Any destination',
    };
    setSpendingLimits((prev) => [...prev, newLimit]);
    setNewLimitAmount('');
    setNewLimitLabel('');
    setNewLimitDest('');
    setShowLimitModal(false);
    toast.success('Spending limit added');
  };

  const handleRemoveSpendingLimit = (id: string) => {
    setSpendingLimits((prev) => prev.filter((item) => item.id !== id));
    toast.success('Spending limit removed');
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

  const activeTreasuryName = treasuryConfig?.name || currentProfile?.businessName || 'Excelsior Ecosystem';
  const vaultAddress = treasuryConfig?.address || 'HQ8eEKM8MWZ45sKaXoD3jf3fHUYQqYCgYeogRrejRe';
  const multisigAccountPda = treasuryConfig?.address || 'CLveCuyYmmVH8f7q6ydRkXYWpayGVveZB6DYYkiyyCcx';
  const solanaNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta';

  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">Settings</h1>
          <p className="lx-page-subtitle">
            Manage your account preferences, treasury multisig security, POS terminals, and developer API keys.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-5xl mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('general')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'general'
                ? 'bg-white text-black'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            <SettingsIcon size={15} /> General & Multisig
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pos')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'pos'
                ? 'bg-white text-black'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Terminal size={15} /> POS Devices
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('developers')}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'developers'
                ? 'bg-white text-black'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Code2 size={15} /> Developers & API
          </button>
        </div>

        {/* Tab 1: General & Multisig Settings - FLUID SINGLE CONTAINER */}
        {activeTab === 'general' && (
          <div className="space-y-8">
            {/* Active treasury header - Clean, Fluid Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white font-outfit">{activeTreasuryName}</h2>
                <p className="text-xs text-gray-400 font-montserrat mt-1">
                  {treasuryConfig?.createdAt ? `Created on ${new Date(treasuryConfig.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} · ` : ''}Luxor multisig
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-outfit">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Members</span>
                  <span className="text-white font-semibold text-base">{members.length}</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase tracking-wider font-semibold">Threshold</span>
                  <span className="text-white font-semibold text-base">{threshold}/{signerCount}</span>
                </div>
              </div>
            </div>

            {/* Treasury vault (read-only) */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 block mb-1 font-outfit">Treasury Vault</span>
                <div className="flex items-center justify-between py-2 text-sm font-mono text-white">
                  <span className="truncate">{vaultAddress}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(vaultAddress);
                        toast.success('Vault address copied');
                      }}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="Copy vault address"
                    >
                      <Copy size={15} />
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${vaultAddress}?cluster=${solanaNetwork}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="View on Solana Explorer"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-400 font-outfit">Multisig Account (PDA)</span>
                  <span className="text-[10px] uppercase font-mono text-gray-400">Fixed On-Chain</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm font-mono text-white">
                  <span className="truncate">
                    {maskMultisigAccount ? `${multisigAccountPda.slice(0, 4)}******` : multisigAccountPda}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setMaskMultisigAccount(!maskMultisigAccount)}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title={maskMultisigAccount ? 'Show full Multisig PDA' : 'Hide Multisig PDA'}
                    >
                      {maskMultisigAccount ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(multisigAccountPda);
                        toast.success('Multisig PDA address copied');
                      }}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="Copy Multisig PDA address"
                    >
                      <Copy size={15} />
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${multisigAccountPda}?cluster=${solanaNetwork}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
                      title="View on Solana Explorer"
                    >
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Controls */}
            <div className="space-y-6 border-b border-white/10 pb-6">
              {/* Spending Limits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white font-outfit">Spending Limits</h3>
                    <p className="text-xs text-gray-400 font-montserrat">
                      Grant members a spending limit to withdraw funds without requiring multi-signer approval.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLimitModal(true)}
                    className="px-3 py-1.5 border border-white/20 text-white font-medium text-xs rounded-full hover:bg-white/10 transition-colors font-outfit"
                  >
                    <Plus size={13} className="inline mr-1" /> Add Limit
                  </button>
                </div>

                {spendingLimits.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 text-xs border-b border-white/5">
                    <div>
                      <span className="font-semibold text-white font-outfit">{item.amount}</span>
                      <span className="text-gray-400 ml-2 font-montserrat">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span>{item.timeframe}</span>
                      <span className="font-mono">{item.destination}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpendingLimit(item.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-semibold text-white font-outfit">Privacy</h3>
                  <p className="text-xs text-gray-400 font-montserrat">
                    Restricts treasury viewing to members only. On-chain transactions remain visible.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !privacyEnabled;
                    setPrivacyEnabled(next);
                    setPrivacyLastChanged(new Date().toLocaleDateString('en-US'));
                    toast.success(next ? 'Privacy mode enabled' : 'Privacy mode disabled');
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                    privacyEnabled ? 'bg-white' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-transform ${
                      privacyEnabled ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'
                    }`}
                  />
                </button>
              </div>

              {/* Time Lock */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-semibold text-white font-outfit">Time Lock</h3>
                  <p className="text-xs text-gray-400 font-montserrat">
                    Freeze transactions for a specified duration before execution.
                  </p>
                </div>
                <select
                  value={timelock}
                  onChange={(e) => {
                    setTimelock(e.target.value);
                    toast.success('Timelock period updated');
                  }}
                  className="bg-transparent border border-white/20 rounded-full px-3 py-1.5 text-xs text-white outline-none font-outfit"
                >
                  <option value="none" className="bg-black">None</option>
                  <option value="300" className="bg-black">300s (5 min)</option>
                  <option value="3600" className="bg-black">3600s (1 hour)</option>
                  <option value="86400" className="bg-black">86400s (24 hours)</option>
                </select>
              </div>

              {pendingThreshold && <PendingChangeNotice proposal={pendingThreshold} />}

              {/* Threshold Adjuster */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white font-outfit">Signing Threshold</h3>
                  <p className="text-xs text-gray-400 font-montserrat">
                    {!isEditingThreshold ? (
                      `${threshold} of ${signerCount} signers required to execute proposals.`
                    ) : (
                      <span className="text-amber-400 font-medium">
                        Selecciona el nuevo umbral ({editableThreshold} de {signerCount}) y pulsa Guardar para firmar.
                      </span>
                    )}
                  </p>
                </div>

                {!isEditingThreshold ? (
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center text-xs font-semibold text-white font-mono bg-white/10 py-1 px-2.5 rounded-full border border-white/15">
                      {threshold}
                    </span>
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      disabled={!!pendingThreshold}
                      title={pendingThreshold ? `Hay un cambio pendiente (#${pendingThreshold.index}): apruébalo o recházalo antes de crear otro` : undefined}
                      className="px-4 py-1.5 border border-white/20 text-white font-medium text-xs rounded-full hover:bg-white/10 transition-colors font-outfit flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Pencil size={13} /> Editar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-full p-1 border border-white/20 bg-white/5">
                      <button
                        type="button"
                        disabled={editableThreshold <= 1 || savingThreshold}
                        onClick={handleDecrementThreshold}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                        title="Disminuir umbral"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-white font-mono">{editableThreshold}</span>
                      <button
                        type="button"
                        disabled={editableThreshold >= signerCount || savingThreshold}
                        onClick={handleIncrementThreshold}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                        title="Aumentar umbral"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={savingThreshold}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors"
                        title="Cancelar edición"
                      >
                        <X size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveThreshold}
                        disabled={savingThreshold}
                        className="px-4 py-1.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all font-outfit flex items-center gap-1.5"
                      >
                        {savingThreshold ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            Firmando…
                          </>
                        ) : (
                          'Guardar'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        )}

        {/* Tab 2: POS Devices */}
        {activeTab === 'pos' && (
          <div className="space-y-6 max-w-xl">
            <form onSubmit={handleCreatePos} className="space-y-4 border-b border-white/10 pb-6">
              <h2 className="text-base font-semibold text-white font-outfit">Register POS Device</h2>
              <div className="space-y-3">
                <input
                  value={posName}
                  onChange={(e) => setPosName(e.target.value)}
                  placeholder="Store counter #1"
                  className="w-full bg-transparent border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-montserrat"
                />
                <input
                  value={posId}
                  onChange={(e) => setPosId(e.target.value)}
                  placeholder="POS ID (serial or label)"
                  className="w-full bg-transparent border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-montserrat"
                />
              </div>
              <button
                type="submit"
                disabled={creatingPos}
                className="px-6 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all disabled:opacity-50 font-outfit"
              >
                {creatingPos ? 'Saving…' : 'Register POS'}
              </button>
            </form>

            {loadingDevices ? (
              <p className="text-gray-500 text-sm">Loading devices…</p>
            ) : devices.length === 0 ? (
              <p className="text-gray-500 text-xs font-montserrat">No POS devices registered yet.</p>
            ) : (
              <div className="space-y-3">
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <h3 className="font-medium text-white text-sm font-outfit">{d.name}</h3>
                      <p className="text-xs text-gray-400 font-montserrat">
                        POS ID: <code className="text-white font-mono">{d.posId}</code>
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
          <div className="space-y-6 max-w-xl">
            {newSecret && (
              <div className="p-4 border border-white/20 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-white font-outfit">New secret key (shown once)</p>
                <code className="block text-xs break-all bg-black/60 p-3 rounded-lg font-mono text-white">{newSecret}</code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(newSecret);
                    toast.success('Copied');
                  }}
                  className="text-xs flex items-center gap-1.5 text-white hover:underline font-outfit"
                >
                  <Copy size={13} /> Copy Key
                </button>
              </div>
            )}

            <form onSubmit={handleCreateKey} className="flex gap-3 border-b border-white/10 pb-6">
              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="Key name (e.g. Production POS)"
                className="flex-1 bg-transparent border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-montserrat"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all font-outfit"
              >
                Create Key
              </button>
            </form>

            {loadingKeys ? (
              <p className="text-gray-500 text-sm">Loading keys…</p>
            ) : keys.length === 0 ? (
              <p className="text-gray-500 text-xs font-montserrat">No API keys yet.</p>
            ) : (
              <div className="space-y-3">
                {keys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="font-medium text-white text-sm font-outfit">{k.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{k.keyPrefix}…</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeKey(k.id)}
                      className="p-1.5 text-gray-400 hover:text-white transition-colors"
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

      {/* Modal for adding spending limit */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white font-outfit">Add Spending Limit</h3>
              <button
                type="button"
                onClick={() => setShowLimitModal(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSpendingLimit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 font-outfit block mb-1">Limit Amount (e.g. 1 SOL)</label>
                <input
                  value={newLimitAmount}
                  onChange={(e) => setNewLimitAmount(e.target.value)}
                  placeholder="1 SOL"
                  className="w-full bg-transparent border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-montserrat"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-outfit block mb-1 font-outfit">Label / Description</label>
                <input
                  value={newLimitLabel}
                  onChange={(e) => setNewLimitLabel(e.target.value)}
                  placeholder="Fee Relayer"
                  className="w-full bg-transparent border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white outline-none font-montserrat"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 font-outfit block mb-1 font-outfit">Destination Address (Optional)</label>
                <input
                  value={newLimitDest}
                  onChange={(e) => setNewLimitDest(e.target.value)}
                  placeholder="Solana wallet address"
                  className="w-full bg-transparent border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLimitModal(false)}
                  className="px-4 py-2 rounded-full text-xs text-gray-400 hover:bg-white/10 font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 font-outfit"
                >
                  Add Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white text-sm">Loading settings…</div>}>
      <SettingsContent />
    </Suspense>
  );
}
