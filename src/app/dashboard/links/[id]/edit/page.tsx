'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile, getPaymentLink, updatePaymentLink } from '@/lib/merchant-data';
import { isFrontendOnly } from '@/lib/frontend-only';
import type { MerchantProfile, PaymentLink } from '@luxor/contracts';
import {
  PaymentLinkEditor,
  editorValuesToPaymentLinkInput,
  paymentLinkToEditorValues,
  type PaymentLinkEditorValues,
} from '@/components/dashboard/PaymentLinkEditor';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function EditPaymentLinkPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [link, setLink] = useState<PaymentLink | null>(null);
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const canEdit = true;

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [l, profile] = await Promise.all([
          getPaymentLink(user.uid, id),
          getMerchantProfile(user.uid),
        ]);
        setLink(l);
        setMerchantProfile(profile);
        if (profile?.businessName) setMerchantName(profile.businessName);
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'No se pudo cargar el enlace de pago'));
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [id]);

  const handleSave = async (values: PaymentLinkEditorValues) => {
    const user = auth.currentUser;
    if (!user || !id || !canEdit) return;

    const input = editorValuesToPaymentLinkInput(values);
    if (!input.name || Number.isNaN(input.amount) || input.amount <= 0) {
      toast.error('Ingresa un nombre de producto y un monto válido');
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePaymentLink(user.uid, id, input);
      setLink(updated);
      toast.success('Enlace de pago actualizado');
      router.push(`/dashboard/links/${id}`);
    } catch (err) {
      toast.error(getFirestoreErrorMessage(err, 'No se pudo actualizar el enlace de pago'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Cargando editor…</p>
    );
  }

  if (!link) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-[var(--dash-muted)]">Enlace de pago no encontrado</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/links')}
          className="dash-btn-secondary px-4 py-2 text-sm"
        >
          Volver a enlaces
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh min-h-0">
      <div className="flex-1 min-h-0">
        <PaymentLinkEditor
          mode="edit"
          layout="page"
          initialValues={paymentLinkToEditorValues(link)}
          merchantName={merchantName}
          merchantProfile={merchantProfile}
          saving={saving}
          submitDisabled={!canEdit}
          onSave={handleSave}
          onCancel={() => router.push(`/dashboard/links/${id}`)}
        />
      </div>
    </div>
  );
}
