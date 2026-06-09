'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { createPosDevice, listPosDevices } from '@/lib/payments-api';
import type { PosDevice } from '@luxor/contracts';
import { dashStatusBadges } from '@/lib/dashboard-styles';
import { Terminal, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageHeader,
  DataTable,
  TerminalOnboardingHero,
  type DataTableColumn,
} from '@/components/dashboard';

export default function PosDevicesPage() {
  const [devices, setDevices] = useState<PosDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [posId, setPosId] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

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
      setShowForm(false);
      toast.success('POS device registered');
    } catch {
      toast.error('Could not register device');
    } finally {
      setCreating(false);
    }
  };

  const handleGetStarted = () => {
    setShowForm(true);
  };

  const isOnboarding = !loading && devices.length === 0;

  const columns: DataTableColumn<PosDevice>[] = [
    {
      key: 'name',
      header: 'Device',
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--dash-accent-soft)] flex items-center justify-center text-[var(--dash-accent)]">
            <Terminal size={14} />
          </div>
          <span className="font-medium">{d.name}</span>
        </div>
      ),
    },
    {
      key: 'posId',
      header: 'POS ID',
      render: (d) => <code className="text-xs font-mono text-[var(--dash-accent)]">{d.posId}</code>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (d) => (
        <span className={d.active ? dashStatusBadges.success : dashStatusBadges.neutral}>
          {d.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'lastSeen',
      header: 'Last seen',
      render: (d) => (
        <span className="text-[var(--dash-muted)] text-sm">
          {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString() : '—'}
        </span>
      ),
    },
  ];

  const registrationForm = (
    <form ref={formRef} onSubmit={handleCreate} className="space-y-4" id="register-device">
      <h2 className="font-semibold text-[var(--dash-text)] flex items-center gap-2">
        <Plus size={18} className="text-[var(--dash-accent)]" /> Register your first terminal
      </h2>
      <p className="text-sm text-[var(--dash-muted)]">
        Give your device a name and POS ID, then use the charge endpoint from your integration.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Store counter #1"
          className="dash-input px-4 py-2.5 text-sm"
        />
        <input
          value={posId}
          onChange={(e) => setPosId(e.target.value)}
          placeholder="POS ID (serial or label)"
          className="dash-input px-4 py-2.5 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={creating}
        className="dash-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
      >
        {creating ? 'Saving…' : 'Register POS'}
      </button>
    </form>
  );

  const chargeEndpointCard = (
    <div className="dash-card p-5 text-sm space-y-2">
      <p className="font-semibold text-[var(--dash-text)]">Charge endpoint</p>
      <code className="block text-xs text-[var(--dash-muted)] font-mono bg-[var(--dash-surface-elevated)] p-3 rounded-md">
        POST /api/v1/pos/charge (demo — not connected)
        <br />
        Header: X-Api-Key: sk_demo_…
      </code>
      <p className="text-xs text-[var(--dash-muted)]">
        See{' '}
        <Link href="/dashboard/developers" className="text-[var(--dash-accent)] hover:underline">
          Developers
        </Link>{' '}
        for request examples. POS devices are stored locally; charge calls are frontend demo only.
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="dash-card p-10 text-center text-sm text-[var(--dash-muted)]">
          Loading Terminal…
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <>
        <TerminalOnboardingHero onGetStarted={handleGetStarted}>
          {showForm ? registrationForm : null}
        </TerminalOnboardingHero>
        {showForm && (
          <div className="px-6 md:px-8 pb-8 max-w-3xl mx-auto space-y-6">{chargeEndpointCard}</div>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Terminal"
        description="Manage POS devices for in-person Solana Pay charges (SOL/USDC) — settles to your merchant wallet."
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="dash-btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {showForm ? 'Cancel' : 'Register device'}
          </button>
        }
      />

      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        {showForm && (
          <div className="dash-card p-6">{registrationForm}</div>
        )}

        {chargeEndpointCard}

        <DataTable
          columns={columns}
          data={devices}
          rowKey={(d) => d.id}
          loading={loading}
          loadingMessage="Loading POS devices…"
        />
      </div>
    </>
  );
}
