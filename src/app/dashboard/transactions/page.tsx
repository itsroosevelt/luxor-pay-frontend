'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { listPayments } from '@/lib/payments-api';
import type { PaymentOrder } from '@luxor/contracts';
import { getExplorerTxUrl } from '@/web3/config/network';
import { toast } from 'sonner';

const statusColor: Record<PaymentOrder['status'], string> = {
  pending: 'text-amber-400 bg-amber-400/10',
  confirmed: 'text-primary bg-primary/10',
  expired: 'text-gray-400 bg-white/5',
  failed: 'text-red-400 bg-red-400/10',
};

export default function TransactionsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const data = await listPayments(token);
        setOrders(data);
      } catch {
        toast.error('Could not load transactions. Is the backend running?');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="p-6 md:p-10 border-b border-white/5">
        <h1 className="text-2xl font-bold mb-1">Transactions</h1>
        <p className="text-gray-400 text-sm">All Solana payment orders for your account.</p>
      </header>

      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
            No transactions yet. Share a payment link to receive your first payment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500 border-b border-white/10">
                <tr>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Reference</th>
                  <th className="py-3">Tx</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.reference} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 pr-4 text-gray-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 pr-4 font-medium">
                      {o.amount} {o.currency}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs text-gray-500 max-w-[120px] truncate">
                      {o.reference}
                    </td>
                    <td className="py-4">
                      {o.signature ? (
                        <a
                          href={getExplorerTxUrl(o.signature)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-xs"
                        >
                          Explorer
                        </a>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
