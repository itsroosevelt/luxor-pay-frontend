import { z } from 'zod';

export const currencySchema = z.enum(['SOL', 'USDC']);

export const chargeRequestSchema = z.object({
  amount: z.number().positive(),
  currency: currencySchema,
  posId: z.string().min(1),
  merchantWallet: z.string().min(32).optional(),
  description: z.string().optional(),
});

export const createPaymentLinkSchema = z.object({
  name: z.string().min(1).max(120),
  amount: z.number().positive(),
  currency: currencySchema.default('USDC'),
  active: z.boolean().optional(),
  collectEmail: z.boolean().optional(),
  successMessage: z.string().max(500).optional(),
  redirectUrl: z.string().url().max(500).optional().or(z.literal('')),
});

export const updatePaymentLinkSchema = createPaymentLinkSchema.partial();

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(80),
});

export const createPosDeviceSchema = z.object({
  name: z.string().min(1).max(80),
  posId: z.string().min(1).max(64),
});

export const updateMerchantSchema = z.object({
  businessName: z.string().max(120).optional(),
  merchantWallet: z.string().min(32).max(64).optional(),
});

export const createPaymentSchema = z.object({
  linkId: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: currencySchema.optional(),
  label: z.string().max(120).optional(),
  message: z.string().max(200).optional(),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(32),
  signature: z.string().optional(),
});

export const solanaWebhookSchema = z.object({
  reference: z.string().min(32),
  signature: z.string().min(64),
});
