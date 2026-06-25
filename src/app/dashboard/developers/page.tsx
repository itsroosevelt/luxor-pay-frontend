'use client';

import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/auth-client';
import { apiUrl, getApiBaseUrl } from '@/lib/api-client';
import { Key, Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
}

export default function DevelopersPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [adminMissing, setAdminMissing] = useState(false);

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
      toast.error('Could not load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const res = await fetch(apiUrl('/api/v1/api-keys'), {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.status === 503) {
        setAdminMissing(true);
        toast.error('Configure Firebase Admin to use API keys');
        return;
      }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setNewSecret(json.secret);
      setName('');
      await loadKeys();
      toast.success('API key created — copy it now');
    } catch {
      toast.error('Could not create API key');
    }
  };

  const revokeKey = async (id: string) => {
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

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5">
        <h1 className="text-2xl font-bold mb-1">Developers</h1>
        <p className="text-gray-400 text-sm">
          API keys, endpoints, and integrations — same domain as your dashboard.
        </p>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
        {adminMissing && (
          <div className="glass-panel p-4 border border-amber-500/30 text-sm text-amber-100">
            Start the backend and set Firebase Admin in{' '}
            <code className="text-primary">backend/.env</code>.
            Payment links are created via the NestJS API from the dashboard.
          </div>
        )}

        {newSecret && (
          <div className="glass-panel p-4 border border-primary/40 space-y-2">
            <p className="text-sm font-semibold text-primary">New secret key (shown once)</p>
            <code className="block text-xs break-all bg-black/50 p-3 rounded-lg">{newSecret}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(newSecret);
                toast.success('Copied');
              }}
              className="text-sm flex items-center gap-2 text-primary"
            >
              <Copy size={14} /> Copy key
            </button>
          </div>
        )}

        <form onSubmit={createKey} className="glass-panel p-6 flex flex-col sm:flex-row gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. Production POS)"
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-white text-black font-semibold text-sm rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create key
          </button>
        </form>

        <div className="glass-panel p-6 font-mono text-sm text-gray-400 space-y-2">
          <p className="text-white font-sans font-semibold">Base URL</p>
          <p>{getApiBaseUrl()}/api/v1</p>
          <p className="pt-2 text-white font-sans font-semibold">Example</p>
          <p>GET /payment-links · POST /pos/charge · Header X-Api-Key</p>
        </div>

        {loading ? (
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
                  <Key className="text-primary" size={18} />
                  <div>
                    <p className="font-medium">{k.name}</p>
                    <p className="text-xs text-gray-500">{k.keyPrefix}…</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => revokeKey(k.id)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                  aria-label="Revoke key"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
