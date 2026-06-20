export type CheckoutContactFieldConfig = {
  collectEmail?: boolean;
  collectName?: boolean;
  collectCompany?: boolean;
  collectAddress?: boolean;
  collectPhone?: boolean;
};

export type CheckoutContactValues = {
  email?: string;
  name?: string;
  company?: string;
  address?: string;
  phone?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hasRequiredCheckoutContactFields(
  fields: CheckoutContactFieldConfig | undefined
): boolean {
  if (!fields) return false;
  return Boolean(
    fields.collectEmail ||
      fields.collectName ||
      fields.collectCompany ||
      fields.collectAddress ||
      fields.collectPhone
  );
}

export function isCheckoutContactComplete(
  fields: CheckoutContactFieldConfig | undefined,
  values: CheckoutContactValues | undefined
): boolean {
  if (!hasRequiredCheckoutContactFields(fields)) return true;
  if (!fields || !values) return false;

  if (fields.collectEmail) {
    const email = values.email?.trim() ?? '';
    if (!email || !EMAIL_PATTERN.test(email)) return false;
  }
  if (fields.collectName) {
    if (!(values.name?.trim() ?? '')) return false;
  }
  if (fields.collectPhone) {
    if (!(values.phone?.trim() ?? '')) return false;
  }
  if (fields.collectCompany) {
    if (!(values.company?.trim() ?? '')) return false;
  }
  if (fields.collectAddress) {
    if (!(values.address?.trim() ?? '')) return false;
  }
  return true;
}
