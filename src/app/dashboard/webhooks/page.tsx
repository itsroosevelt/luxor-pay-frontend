'use client';

import { useState } from 'react';
import { fetchWebhooksApi, createWebhookApi, deleteWebhookApi } from '@/lib/api/webhooks';
import type { WebhookEndpoint } from '@luxor/contracts';
import {
  PageHeader,
  EmptyState,
  BackendNotice,
  DataTable,
  type DataTableColumn,
} from '@/components/dashboard';
import { useBackendList } from '@/hooks/useBackendList';
import { Webhook, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const EVENT_OPTIONS = ['payment.confirmed', 'payment.failed', 'link.created'];

const columns: DataTableColumn<WebhookEndpoint>[] = [
  {
    key: 'url',
    header: 'Endpoint',
    render: (w) => (
      <code className="text-xs font-mono text-[var(--dash-muted)] break-all">{w.url}</code>
    ),
  },
  {
    key: 'events',
    header: 'Events',
    render: (w) => <span className="text-sm">{w.events.join(', ')}</span>,
  },
  {
    key: 'active',
    header: 'Active',
    render: (w) => (
      <span className={w.active ? 'text-emerald-400' : 'text-[var(--dash-muted)]'}>
        {w.active ? 'Yes' : 'No'}
      </span>
    ),
  },
];

export default function WebhooksPage() {
  const { items, loading, unavailable, notImplemented, error, reload } =
    useBackendList(fetchWebhooksApi);
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setCreating(true);
    const result = await createWebhookApi({ url: url.trim(), events: EVENT_OPTIONS });
    setCreating(false);
    if (result.ok) {
      toast.success('Webhook endpoint created');
      setUrl('');
      reload();
    } else if (result.unavailable) {
      toast.error('Backend unavailable');
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteWebhookApi(id);
    if (result.ok) {
      toast.success('Webhook removed');
      reload();
    } else {
      toast.error(result.error);
    }
  };

  const tableColumns: DataTableColumn<WebhookEndpoint>[] = [
    ...columns,
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (w) => (
        <button
          type="button"
          onClick={() => handleDelete(w.id)}
          className="p-2 text-red-400 hover:bg-red-500/10 rounded-md"
          aria-label="Delete webhook"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Receive HTTPS events when Solana payments confirm or fail."
      />
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <BackendNotice unavailable={unavailable} notImplemented={notImplemented} />
        {error && !unavailable && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        <form onSubmit={handleCreate} className="dash-card p-6 flex flex-col sm:flex-row gap-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-server.com/webhooks/luxor"
            className="dash-input flex-1 px-4 py-2.5 text-sm font-mono"
          />
          <button
            type="submit"
            disabled={creating}
            className="dash-btn-primary px-5 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus size={16} /> Add endpoint
          </button>
        </form>
        {!loading && items.length === 0 ? (
          <EmptyState
            icon={Webhook}
            title="No webhooks"
            description="Register an endpoint to get payment.confirmed payloads with Solana signatures."
          />
        ) : (
          <DataTable
            columns={tableColumns}
            data={items}
            rowKey={(w) => w.id}
            loading={loading}
            loadingMessage="Loading webhooks…"
          />
        )}
      </div>
    </>
  );
}
