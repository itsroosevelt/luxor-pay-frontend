'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createPosDevice, listPosDevices } from '@/lib/payments-api';
import type { PosDevice } from '@luxor/contracts';
import { getApiBaseUrl } from '@/lib/api-client';
import { Terminal, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function PosDevicesPage() {
  const [devices, setDevices] = useState<PosDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [posId, setPosId] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        setDevices(await listPosDevices(token));
      } catch {
        toast.error('Could not load POS devices');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !name.trim() || !posId.trim()) {
      toast.error('Name and POS ID are required');
      return;
    }

    setCreating(true);
    try {
      const token = await user.getIdToken();
      const device = await createPosDevice(token, {
        name: name.trim(),
        posId: posId.trim(),
      });
      setDevices((prev) => [device, ...prev]);
      setName('');
      setPosId('');
      toast.success('POS device registered');
    } catch {
      toast.error('Could not register device');
    } finally {
      setCreating(false);
    }
  };

  const apiBase = getApiBaseUrl();

  return (
    <>
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>POS Devices</h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Register terminals, then charge with your API key.
          </p>
        </div>
      </header>

      <div className="p-6 md:p-10 w-full max-w-7xl mx-auto space-y-8">
        <form onSubmit={handleCreate} className="glass-panel p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Plus size={18} className="text-primary" /> Register device
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Store counter #1"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
            <input
              value={posId}
              onChange={(e) => setPosId(e.target.value)}
              placeholder="POS ID (serial or label)"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-6 py-2.5 bg-white text-black font-medium text-sm rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 shadow-md focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {creating ? 'Saving…' : 'Register POS'}
          </button>
        </form>

        <div className="glass-panel p-6 text-sm text-gray-400 space-y-2 font-mono">
          <p className="text-white font-sans font-semibold mb-2">Charge endpoint</p>
          <p>POST {apiBase}/api/v1/pos/charge</p>
          <p>Header: X-Api-Key: sk_live_…</p>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading devices…</p>
        ) : devices.length === 0 ? (
          <p className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
            No POS devices yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {devices.map((d) => (
              <div key={d.id} className="glass-panel p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <Terminal size={20} />
                </div>
                <div>
                  <h3 className="font-semibold">{d.name}</h3>
                  <p className="text-sm text-gray-400">
                    posId: <code className="text-primary">{d.posId}</code>
                    {d.lastSeenAt ? ` · last seen ${new Date(d.lastSeenAt).toLocaleString()}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
