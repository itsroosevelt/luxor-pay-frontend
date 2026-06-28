import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Currency, MerchantProfile, PaymentLink, PosDevice } from '@luxor/contracts';
import { generateId } from '@luxor/contracts';

function assertDb() {
  if (!db) throw new Error('Firebase is not configured');
  return db;
}

export async function ensureMerchantProfile(
  merchantId: string,
  email: string
): Promise<MerchantProfile> {
  const firestore = assertDb();
  const ref = doc(firestore, 'merchants', merchantId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data() as MerchantProfile;
  }

  const now = new Date().toISOString();
  const profile: MerchantProfile = { email, createdAt: now, updatedAt: now };
  await setDoc(ref, profile);
  return profile;
}

export async function updateMerchantProfile(
  merchantId: string,
  data: Partial<Pick<MerchantProfile, 'businessName' | 'merchantWallet'>>
) {
  const firestore = assertDb();
  const ref = doc(firestore, 'merchants', merchantId);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function getMerchantProfile(merchantId: string): Promise<MerchantProfile | null> {
  const firestore = assertDb();
  const snap = await getDoc(doc(firestore, 'merchants', merchantId));
  return snap.exists() ? (snap.data() as MerchantProfile) : null;
}

export async function listPaymentLinks(merchantId: string): Promise<PaymentLink[]> {
  const firestore = assertDb();
  const q = query(
    collection(firestore, 'paymentLinks'),
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: { id: string; data: () => DocumentData }) => ({
    id: d.id,
    ...(d.data() as Omit<PaymentLink, 'id'>),
  }));
}

export async function createPaymentLink(
  merchantId: string,
  input: { name: string; amount: number; currency: Currency }
): Promise<PaymentLink> {
  const firestore = assertDb();
  const profile = await getMerchantProfile(merchantId);
  if (!profile?.merchantWallet) {
    throw new Error('MERCHANT_WALLET_REQUIRED');
  }

  const id = generateId('lx_');
  const createdAt = new Date().toISOString();
  const link = {
    id,
    merchantId,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    merchantWallet: profile.merchantWallet,
    active: true,
    createdAt,
  } as PaymentLink;
  await setDoc(doc(firestore, 'paymentLinks', id), link);
  return link;
}

export async function getPaymentLinkById(linkId: string): Promise<PaymentLink | null> {
  const firestore = assertDb();
  const snap = await getDoc(doc(firestore, 'paymentLinks', linkId));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  if (!data.active) return null;
  return { id: snap.id, ...(data as Omit<PaymentLink, 'id'>) };
}

export async function listPosDevices(merchantId: string): Promise<PosDevice[]> {
  const firestore = assertDb();
  const q = query(
    collection(firestore, 'posDevices'),
    where('merchantId', '==', merchantId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d: { id: string; data: () => DocumentData }) => ({
    id: d.id,
    ...(d.data() as Omit<PosDevice, 'id'>),
  }));
}

export async function createPosDevice(
  merchantId: string,
  input: { name: string; posId: string }
): Promise<PosDevice> {
  const firestore = assertDb();
  const id = generateId('pos_');
  const createdAt = new Date().toISOString();
  const device: PosDevice = {
    id,
    merchantId,
    name: input.name,
    posId: input.posId,
    active: true,
    createdAt,
  };
  await setDoc(doc(firestore, 'posDevices', id), device);
  return device;
}
