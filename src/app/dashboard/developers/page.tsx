'use client';

import { useEffect, useState } from 'react';
import { createApiKeyApi, fetchApiKeysApi, revokeApiKeyApi } from '@/lib/api/api-keys';
import { Key, Plus, Trash2, Copy, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, EmptyState, DataTable, type DataTableColumn } from '@/components/dashboard';
import type { ApiKeyRecord } from '@luxor/contracts';
import { auth, onAuthStateChanged } from '@/lib/firebase';

export default function DevelopersPage() {
  const [keys, setKeys] = useState<ApiKeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);

  const loadKeys = async () => {
    try {
      const result = await fetchApiKeysApi();
      if (result.ok) {
        setKeys(result.data);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('Could not load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      void loadKeys();
    });
    return () => unsubscribe();
  }, []);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = await createApiKeyApi(name.trim());
    if (result.ok) {
      setNewSecret(result.data.secret ?? null);
      setName('');
      await loadKeys();
      toast.success('API key created — copy it now');
    } else {
      toast.error(result.error);
    }
  };

  const revokeKey = async (id: string) => {
    const result = await revokeApiKeyApi(id);
    if (result.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast.success('API key revoked');
    } else {
      toast.error(result.error);
    }
  };

  const columns: DataTableColumn<ApiKeyRecord>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (k) => (
        <div className="flex items-center gap-3">
          <Key size={16} className="text-[var(--dash-accent)]" />
          <span className="font-medium">{k.name}</span>
        </div>
      ),
    },
    {
      key: 'prefix',
      header: 'Token',
      render: (k) => (
        <code className="text-xs font-mono text-[var(--dash-muted)]">{k.keyPrefix}…</code>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (k) => (
        <span className="text-[var(--dash-muted)] text-sm">
          {new Date(k.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (k) => (
        <button
          type="button"
          onClick={() => revokeKey(k.id)}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          aria-label="Revoke key"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Developers"
        description="API keys stored locally in demo mode — no backend server required."
      />

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="dash-card p-4 text-sm text-[var(--dash-muted)]">
          <strong className="text-[var(--dash-text)]">Frontend demo mode.</strong> Keys are saved in
          your browser. Payment links are stored locally in your browser.
        </div>

        {newSecret && (
          <div className="dash-card p-4 border-[var(--dash-accent)]/30 bg-[var(--dash-accent-soft)] space-y-2">
            <p className="text-sm font-semibold text-[var(--dash-accent)]">
              New secret key (shown once)
            </p>
            <code className="block text-xs break-all bg-[var(--dash-surface)] p-3 rounded-md border border-[var(--dash-border)] font-mono">
              {newSecret}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(newSecret);
                toast.success('Copied');
              }}
              className="text-sm flex items-center gap-2 text-[var(--dash-accent)] font-medium"
            >
              <Copy size={14} /> Copy key
            </button>
          </div>
        )}

        <form onSubmit={createKey} className="dash-card p-6 flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. Production POS)"
            className="dash-input flex-1 px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="dash-btn-primary px-5 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create key
          </button>
        </form>

        <div className="dash-card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Code2 size={18} className="text-[var(--dash-accent)]" />
            <p className="font-semibold text-[var(--dash-text)]">POS charge (demo)</p>
          </div>
          <div className="text-sm text-[var(--dash-muted)] font-mono space-y-1 bg-[var(--dash-surface-elevated)] p-4 rounded-md">
            <p>POST /api/v1/pos/charge (local demo — not live)</p>
            <p>Header X-Api-Key: sk_demo_…</p>
          </div>
          <pre className="text-xs font-mono text-[var(--dash-muted)] bg-[var(--dash-surface-elevated)] p-4 rounded-md overflow-x-auto">
{`curl -X POST /api/v1/pos/charge \\
  -H "X-Api-Key: sk_demo_..." \\
  -d '{"posId": "terminal-1", "amount": 1.5, "currency": "USDC"}'`}
          </pre>
        </div>

        {!loading && keys.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No API keys yet"
            description="Create a demo key to explore the developers UI — stored in localStorage."
          />
        ) : (
          <DataTable
            columns={columns}
            data={keys}
            rowKey={(k) => k.id}
            loading={loading}
            loadingMessage="Loading API keys…"
          />
        )}
      </div>
    </>
  );
}
