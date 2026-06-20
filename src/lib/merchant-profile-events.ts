export const MERCHANT_PROFILE_UPDATED_EVENT = 'luxor:merchant-profile-updated';

export function dispatchMerchantProfileUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(MERCHANT_PROFILE_UPDATED_EVENT));
  }
}
