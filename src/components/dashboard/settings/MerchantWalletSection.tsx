'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { MerchantProfile } from '@luxor/contracts';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { ensureMerchantProfile, getMerchantProfile, updateMerchantProfile } from '@/lib/merchant-data';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { dashStatusBadges } from '@/lib/dashboard/dashboard-styles';
import { toast } from 'sonner';
import { SolanaWalletConnect } from '@/components/dashboard';
import { SettingsSection } from './SettingsSection';
import { Building2, CheckCircle2, Wallet } from 'lucide-react';

export function MerchantWalletSection() {
  const { disconnect, connected } = useWallet();
  const [businessName, setBusinessName] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [savedProfile, setSavedProfile] = useState<MerchantProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  const disconnectConfirmTitleId = useId();

  const applyProfile = useCallback((profile: MerchantProfile) => {
    setSavedProfile(profile);
    setBusinessName(profile.businessName ?? '');
    setMerchantWallet(profile.merchantWallet ?? '');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        await ensureMerchantProfile(user.uid, user.email ?? '');
        const profile = await getMerchantProfile(user.uid);
        if (cancelled || !profile) return;
        applyProfile(profile);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [applyProfile]);

  useEffect(() => {
    if (!disconnectConfirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDisconnectConfirmOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [disconnectConfirmOpen]);

  const handleWalletConnect = useCallback((address: string | null) => {
    if (address) setMerchantWallet(address);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const wallet = merchantWallet.trim();
    if (wallet && wallet.length < 32) {
      toast.error('Introduce una dirección de wallet Solana válida');
      return;
    }

    setSaving(true);
    try {
      await ensureMerchantProfile(user.uid, user.email ?? '');
      const updated = await updateMerchantProfile(user.uid, {
        businessName: businessName.trim() || undefined,
        merchantWallet: wallet,
      });
      applyProfile(updated);
      toast.success('Perfil del comerciante guardado');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo guardar el perfil'));
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnect = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      if (connected) {
        await disconnect();
      }
      setMerchantWallet('');

      if (savedProfile?.merchantWallet?.trim()) {
        await ensureMerchantProfile(user.uid, user.email ?? '');
        const updated = await updateMerchantProfile(user.uid, {
          merchantWallet: '',
        });
        applyProfile(updated);
      }

      toast.success('Wallet desconectada');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo desconectar la wallet'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDisconnect = () => {
    setDisconnectConfirmOpen(false);
    void handleDisconnect();
  };

  const savedWallet = savedProfile?.merchantWallet?.trim() ?? '';
  const draftWallet = merchantWallet.trim();
  const hasSavedWallet = Boolean(savedWallet);
  const hasUnsavedWalletChanges =
    draftWallet !== savedWallet || businessName.trim() !== (savedProfile?.businessName?.trim() ?? '');

  const walletBadge = hasSavedWallet
    ? { label: 'Configurada', className: dashStatusBadges.success }
    : draftWallet
      ? { label: 'Sin guardar', className: dashStatusBadges.warning }
      : { label: 'Sin configurar', className: dashStatusBadges.warning };

  return (
    <SettingsSection
      title="Comerciante y wallet Solana"
      description="Perfil del negocio y dirección para recibir pagos en SOL y USDC."
    >
      {!hydrated ? (
        <div className="px-5 py-4">
          <p className="text-sm text-[var(--dash-muted)]">Cargando perfil…</p>
        </div>
      ) : (
        <>
          <div className="px-5 py-4 border-b border-[var(--dash-border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[var(--dash-accent)]" aria-hidden />
                <h3 className="text-sm font-semibold text-[var(--dash-text)]">Wallet Solana</h3>
              </div>
              <span className={walletBadge.className}>{walletBadge.label}</span>
            </div>

            <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
              Conecta una wallet o pega tu clave pública. Esta dirección recibe liquidaciones de
              enlaces de pago, checkout QR y cargos POS.
            </p>

            {hasSavedWallet && (
              <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-panel)] px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)] shrink-0">
                  <CheckCircle2 size={16} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--dash-text)]">Wallet guardada</p>
                  <p className="text-xs text-[var(--dash-muted)] font-mono break-all mt-0.5">
                    {savedWallet}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDisconnectConfirmOpen(true)}
                  disabled={saving}
                  className="shrink-0 self-start sm:self-center text-xs font-medium text-red-300 hover:text-red-200 disabled:opacity-50 min-h-[44px] px-2"
                >
                  Desconectar
                </button>
              </div>
            )}

            {(connected || draftWallet) && !hasSavedWallet && (
              <button
                type="button"
                onClick={() => setDisconnectConfirmOpen(true)}
                disabled={saving}
                className="text-xs font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
              >
                Desconectar wallet
              </button>
            )}

            {hasUnsavedWalletChanges && draftWallet && !hasSavedWallet && (
              <p className="text-xs text-amber-200/90">
                Tienes una wallet conectada pero aún no guardada. Pulsa «Guardar cambios» abajo para
                poder crear enlaces de pago.
              </p>
            )}

            <SolanaWalletConnect variant="dashboard" onAddressChange={handleWalletConnect} />

            <div>
              <label
                htmlFor="merchant-wallet-address"
                className="text-sm font-medium text-[var(--dash-text)] block mb-1.5"
              >
                Dirección de wallet del comerciante
              </label>
              <input
                id="merchant-wallet-address"
                value={merchantWallet}
                onChange={(e) => setMerchantWallet(e.target.value)}
                className="dash-input w-full px-4 py-2.5 text-sm font-mono"
                placeholder="Tu pubkey Solana (SOL / USDC)"
              />
            </div>
          </div>

          <form onSubmit={handleSave} className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-[var(--dash-accent)]" aria-hidden />
              <h3 className="text-sm font-semibold text-[var(--dash-text)]">Perfil del negocio</h3>
            </div>
            <div>
              <label
                htmlFor="business-name"
                className="text-sm font-medium text-[var(--dash-text)] block mb-1.5"
              >
                Nombre del negocio
              </label>
              <input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="dash-input w-full px-4 py-2.5 text-sm"
                placeholder="Mi tienda"
              />
              <p className="text-xs text-[var(--dash-muted)] mt-1">
                Se muestra en la barra lateral del panel y en las páginas de checkout.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </>
      )}

      {disconnectConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            onClick={() => setDisconnectConfirmOpen(false)}
            aria-label="Cerrar"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={disconnectConfirmTitleId}
            className="relative w-full max-w-md dash-modal shadow-xl rounded-t-xl sm:rounded-xl max-h-[90dvh] overflow-y-auto"
          >
            <div className="px-5 py-4 border-b border-[var(--dash-border)]">
              <h2 id={disconnectConfirmTitleId} className="font-semibold text-[var(--dash-text)]">
                Desconectar wallet
              </h2>
            </div>

            <div className="p-5">
              <p className="text-sm text-[var(--dash-muted)] leading-relaxed">
                ¿Seguro que quieres desconectar la wallet?
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--dash-border)]">
              <button
                type="button"
                onClick={() => setDisconnectConfirmOpen(false)}
                className="dash-btn-secondary px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDisconnect}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}
    </SettingsSection>
  );
}
