'use client';

import { useCallback, useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { ensureMerchantProfile, getMerchantProfile, updateMerchantProfile } from '@/lib/firestore-data';
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
      toast.error('Introduce una dirección de wallet Solana válida');
      return;
    }

    setSaving(true);
    try {
      await ensureMerchantProfile(user.uid, user.email ?? '');
      await updateMerchantProfile(user.uid, {
        businessName: businessName.trim() || undefined,
        merchantWallet: wallet || undefined,
      });
      toast.success('Perfil del comercio guardado');
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo guardar el perfil'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection
      title="Comercio y wallet Solana"
      description="Perfil del negocio y dirección para recibir pagos en SOL y USDC."
    >
      {!hydrated ? (
        <div className="px-5 py-4">
          <p className="text-sm text-[var(--dash-muted)]">Cargando perfil…</p>
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
              Conecta una wallet o pega tu clave pública manualmente. Esta dirección recibe
              liquidaciones de enlaces de pago, checkout QR y cargos POS.
            </p>
            <SolanaWalletConnect onAddressChange={handleWalletConnect} />
            <div>
              <label className="text-sm font-medium text-[var(--dash-text)] block mb-1.5">
                Dirección de wallet del comercio
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
              <h3 className="text-sm font-semibold text-[var(--dash-text)]">Perfil del negocio</h3>
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--dash-text)] block mb-1.5">
                Nombre del negocio
              </label>
              <input
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
    </SettingsSection>
  );
}
