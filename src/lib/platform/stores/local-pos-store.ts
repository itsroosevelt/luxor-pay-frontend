import { generateId } from '@luxor/contracts';
import type { PosDevice } from '@luxor/contracts';
import { readJson, writeJson } from '@/lib/local-storage-utils';

const POS_PREFIX = 'luxor-pos-devices:';

function posKey(merchantId: string): string {
  return `${POS_PREFIX}${merchantId}`;
}

function readMerchantPosDevices(merchantId: string): PosDevice[] {
  return readJson<PosDevice[]>(posKey(merchantId), []);
}

export function listLocalPosDevices(merchantId: string): PosDevice[] {
  return readMerchantPosDevices(merchantId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createLocalPosDevice(
  merchantId: string,
  input: { name: string; posId: string }
): PosDevice {
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
  const devices = readMerchantPosDevices(merchantId);
  writeJson(posKey(merchantId), [device, ...devices]);
  return device;
}
