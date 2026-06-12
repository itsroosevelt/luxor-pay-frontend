'use client';

import { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { getMerchantProfile } from '@/lib/merchant-data';
import { SolanaPayQrGenerator } from '@/components/dashboard/SolanaPayQrGenerator';
import { getFirestoreErrorMessage } from '@/lib/firestore-errors';
import { toast } from 'sonner';

export default function SolanaPayQrPage() {
  const [merchantName, setMerchantName] = useState('Luxor Pay');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setReady(true);
        return;
      }
      try {
        const profile = await getMerchantProfile(user.uid);
        if (profile?.businessName) setMerchantName(profile.businessName);
        setMerchantWallet(profile?.merchantWallet ?? '');
      } catch (err) {
        toast.error(getFirestoreErrorMessage(err, 'Could not load merchant profile'));
      } finally {
        setReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!ready) {
    return (
      <p className="text-sm text-[var(--dash-muted)] py-16 text-center">Loading QR generator…</p>
    );
  }

  return (
    <SolanaPayQrGenerator merchantWallet={merchantWallet} merchantName={merchantName} />
  );
}
