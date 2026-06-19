'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { DetailSection } from '@/components/dashboard/DetailSection';
import { AdminToggle } from '@/components/admin/AdminToggle';
import {
  addPlatformToken,
  loadPlatformConfig,
  savePlatformConfig,
  setDefaultPlatformToken,
  togglePlatformToken,
  type PlatformToken,
} from '@/lib/platform-config';
import { MOCK_TREASURY_BALANCES } from '@/lib/admin-metrics';
import { appendSecurityLog } from '@/lib/admin-users';
import { toast } from 'sonner';
import { Wallet, Copy, RefreshCw, Plus, X, Star } from 'lucide-react';
import { cn } from '@/lib/cn';

const TOKEN_COLORS: Record<string, string> = {
  SOL: '#9945FF',
  USDC: 'var(--dash-accent)',
  USDT: '#26A17B',
  LUXURE: '#C9A227',
};

function tokenColor(symbol: string): string {
  return TOKEN_COLORS[symbol.toUpperCase()] ?? '#64748B';
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function getDemoBalance(token: PlatformToken): { balance: number; usdValue: number } {
  const known = MOCK_TREASURY_BALANCES[token.symbol as keyof typeof MOCK_TREASURY_BALANCES];
  if (known) return known;
  const balance = token.demoBalance ?? 0;
  return { balance, usdValue: balance };
}

type AddTokenModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (input: {
    symbol: string;
    name: string;
    description?: string;
    mintAddress?: string;
  }) => void;
};

function AddTokenModal({ open, onClose, onAdd }: AddTokenModalProps) {
  const titleId = useId();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mintAddress, setMintAddress] = useState('');

  const reset = useCallback(() => {
    setSymbol('');
    setName('');
    setDescription('');
    setMintAddress('');
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, handleClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSymbol = symbol.trim().toUpperCase();
    const trimmedName = name.trim();
    if (!trimmedSymbol || !trimmedName) {
      toast.error('Símbolo y nombre son obligatorios');
      return;
    }
    onAdd({
      symbol: trimmedSymbol,
      name: trimmedName,
      description: description.trim() || undefined,
      mintAddress: mintAddress.trim() || undefined,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-label="Cerrar"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg dash-modal shadow-xl"
      >
        <div className="px-6 py-5 border-b border-[var(--dash-border)]">
          <h2 id={titleId} className="text-lg font-semibold text-[var(--dash-text)] pr-8">
            Agregar token
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-elevated)]"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="token-symbol" className="block text-sm font-medium mb-1.5">
              Símbolo
            </label>
            <input
              id="token-symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Ej. LUXURE"
              className="dash-input w-full px-4 py-2.5 text-sm font-mono uppercase"
              required
            />
          </div>
          <div>
            <label htmlFor="token-name" className="block text-sm font-medium mb-1.5">
              Nombre
            </label>
            <input
              id="token-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Luxure"
              className="dash-input w-full px-4 py-2.5 text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="token-description" className="block text-sm font-medium mb-1.5">
              Descripción (opcional)
            </label>
            <input
              id="token-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Token nativo de la plataforma"
              className="dash-input w-full px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="token-mint" className="block text-sm font-medium mb-1.5">
              Mint address (opcional)
            </label>
            <input
              id="token-mint"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="Dirección del mint en Solana"
              className="dash-input w-full px-4 py-2.5 text-sm font-mono"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={handleClose} className="dash-btn-secondary px-4 py-2 text-sm">
              Cancelar
            </button>
            <button type="submit" className="dash-btn-primary px-4 py-2 text-sm">
              Agregar token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminTokensPage() {
  const [tokens, setTokens] = useState<PlatformToken[]>(() => loadPlatformConfig().tokens);
  const [defaultTokenId, setDefaultTokenId] = useState<string | null>(
    () => loadPlatformConfig().defaultTokenId
  );
  const [treasuryAddress, setTreasuryAddress] = useState(
    () => loadPlatformConfig().treasuryWalletAddress
  );
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const enabledTokens = tokens.filter((t) => t.enabled);

  const handleToggle = (tokenId: string, enabled: boolean) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return;

    if (!enabled && token.id === defaultTokenId) {
      toast.error('No puedes desactivar el token predeterminado. Elige otro primero.');
      return;
    }

    const next = togglePlatformToken(tokenId, enabled);
    setTokens(next.tokens);
    setDefaultTokenId(next.defaultTokenId);
    toast.success(`${token.symbol} ${enabled ? 'activado' : 'desactivado'}`);
  };

  const handleSetDefault = (tokenId: string) => {
    const token = tokens.find((t) => t.id === tokenId);
    if (!token) return;

    const next = setDefaultPlatformToken(tokenId);
    setTokens(next.tokens);
    setDefaultTokenId(next.defaultTokenId);
    appendSecurityLog({
      type: 'config_change',
      email: 'admin@luxor.pay',
      description: `Token predeterminado: ${token.symbol}`,
    });
    toast.success(`${token.symbol} establecido como predeterminada`);
  };

  const handleAddToken = (input: {
    symbol: string;
    name: string;
    description?: string;
    mintAddress?: string;
  }) => {
    const before = loadPlatformConfig();
    const duplicate = before.tokens.some(
      (t) => t.symbol.toUpperCase() === input.symbol.toUpperCase()
    );
    if (duplicate) {
      toast.error(`Ya existe un token con símbolo ${input.symbol}`);
      return;
    }

    const next = addPlatformToken(input);
    setTokens(next.tokens);
    setDefaultTokenId(next.defaultTokenId);
    appendSecurityLog({
      type: 'config_change',
      email: 'admin@luxor.pay',
      description: `Token agregado: ${input.symbol}`,
    });
    toast.success(`Token ${input.symbol} agregado`);
  };

  const handleSaveTreasury = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    savePlatformConfig({ treasuryWalletAddress: treasuryAddress.trim() });
    appendSecurityLog({
      type: 'config_change',
      email: 'admin@luxor.pay',
      description: 'Wallet de tesorería actualizada',
    });
    toast.success('Wallet de tesorería guardada');
    setSaving(false);
  };

  const handleRefreshBalances = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.info('Balances actualizados (demo — RPC pendiente)');
    }, 800);
  };

  const totalUsd = enabledTokens.reduce((sum, token) => sum + getDemoBalance(token).usdValue, 0);

  return (
    <div>
      <PageHeader
        title="Tokens y treasury"
        description="Tokens soportados en checkout y configuración de la wallet de tesorería de la plataforma."
        actions={
          <button
            type="button"
            onClick={handleRefreshBalances}
            disabled={refreshing}
            className="dash-btn-secondary px-4 py-2 text-sm inline-flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualizar balances
          </button>
        }
      />

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-6 max-w-4xl mx-auto">
        <DetailSection
          title="Tokens soportados"
          description="Activa o desactiva tokens disponibles para pagos. Marca uno como predeterminada para checkout."
          action={
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="dash-btn-primary px-3 py-1.5 text-sm inline-flex items-center gap-1.5 shrink-0"
            >
              <Plus size={14} />
              Agregar token
            </button>
          }
        >
          <div className="space-y-3">
            {tokens.map((token) => {
              const color = tokenColor(token.symbol);
              const isDefault = token.id === defaultTokenId;
              const balance = getDemoBalance(token);

              return (
                <div
                  key={token.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-[var(--dash-border)]"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {token.symbol.slice(0, 4)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{token.name}</p>
                        {isDefault && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[var(--dash-accent)]/15 text-[var(--dash-accent)]">
                            <Star size={10} fill="currentColor" />
                            Predeterminada
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--dash-muted)]">
                        {token.description ?? `Token ${token.symbol}`}
                      </p>
                      {token.mintAddress && (
                        <p className="text-xs text-[var(--dash-muted)] mt-1 font-mono truncate">
                          Mint: {token.mintAddress}
                        </p>
                      )}
                      {token.enabled && (
                        <p className="text-xs text-[var(--dash-muted)] mt-1 tabular-nums">
                          Balance demo: {balance.balance.toLocaleString('es-ES')} {token.symbol} (
                          {formatUsd(balance.usdValue)})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 sm:ml-auto">
                    {!isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(token.id)}
                        className="dash-btn-secondary px-3 py-1.5 text-xs whitespace-nowrap"
                      >
                        Establecer como predeterminada
                      </button>
                    )}
                    <AdminToggle
                      checked={token.enabled}
                      onChange={(checked) => handleToggle(token.id, checked)}
                      label={`Activar ${token.symbol}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </DetailSection>

        <DetailSection
          title="Wallet de tesorería"
          description="Dirección Solana donde se acumulan las comisiones de plataforma."
        >
          <form onSubmit={handleSaveTreasury} className="space-y-4 max-w-xl">
            <div>
              <label
                htmlFor="treasury-wallet"
                className="flex items-center gap-2 text-sm font-medium mb-1.5"
              >
                <Wallet size={14} className="text-[var(--dash-muted)]" />
                Dirección de wallet
              </label>
              <input
                id="treasury-wallet"
                value={treasuryAddress}
                onChange={(e) => setTreasuryAddress(e.target.value)}
                placeholder="Ej. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                className="dash-input w-full px-4 py-2.5 text-sm font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="dash-btn-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar wallet'}
            </button>
          </form>
        </DetailSection>

        <DetailSection
          title="Balances de tesorería"
          description="Vista consolidada de activos (demo — consulta RPC pendiente)."
        >
          <div className="mb-4 p-4 rounded-lg bg-[var(--dash-surface-elevated)]">
            <p className="text-xs text-[var(--dash-muted)]">Valor total estimado</p>
            <p className="text-2xl font-semibold tabular-nums mt-1">{formatUsd(totalUsd)}</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {enabledTokens.map((token) => {
              const balance = getDemoBalance(token);
              const isDefault = token.id === defaultTokenId;
              return (
                <div
                  key={token.id}
                  className={cn(
                    'p-4 rounded-lg border border-[var(--dash-border)]',
                    'bg-[var(--dash-surface-elevated)]',
                    isDefault && 'ring-1 ring-[var(--dash-accent)]/40'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[var(--dash-muted)]">{token.symbol}</p>
                    {isDefault && (
                      <span className="text-[10px] font-semibold uppercase text-[var(--dash-accent)]">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold tabular-nums mt-1">
                    {balance.balance.toLocaleString('es-ES', { maximumFractionDigits: 4 })}
                  </p>
                  <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                    ≈ {formatUsd(balance.usdValue)}
                  </p>
                </div>
              );
            })}
          </div>
          {treasuryAddress && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[var(--dash-muted)]">
              <Copy size={12} />
              <span className="font-mono truncate">{treasuryAddress}</span>
            </div>
          )}
        </DetailSection>
      </div>

      <AddTokenModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddToken}
      />
    </div>
  );
}
