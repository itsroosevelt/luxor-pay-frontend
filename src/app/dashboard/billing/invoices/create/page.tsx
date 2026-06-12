'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, listCustomers } from '@/lib/merchant-data';
import { listProducts } from '@/lib/merchant-data';
import type { Customer, ProductCatalogItem } from '@luxor/contracts';
import {
  InvoiceCreateEditor,
  type InvoiceCreateValues,
} from '@/components/dashboard/InvoiceCreateEditor';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const [profile, customerList, productList] = await Promise.all([
          getMerchantProfile(user.uid),
          listCustomers(user.uid).catch(() => [] as Customer[]),
          listProducts(user.uid).catch(() => [] as ProductCatalogItem[]),
        ]);
        if (profile?.businessName) setMerchantName(profile.businessName);
        setCustomers(customerList);
        setProducts(productList);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load invoice editor'));
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleReview = async (values: InvoiceCreateValues) => {
    const hasValidItems = values.lineItems.some(
      (item) => item.name.trim() && item.amount > 0
    );
    if (!values.customerName.trim() || !hasValidItems) {
      toast.error('Select a customer and add at least one line item');
      return;
    }

    setSaving(true);
    try {
      toast.info('Invoice review — backend integration coming soon');
      router.push('/dashboard/billing/invoices');
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading editor…</p>
    );
  }

  return (
    <InvoiceCreateEditor
      merchantName={merchantName}
      customers={customers}
      products={products}
      saving={saving}
      onReview={handleReview}
      onCancel={() => router.push('/dashboard/billing/invoices')}
    />
  );
}
