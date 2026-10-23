/**
 * Typed, validated environment variables using Zod.
 * All process.env access should go through this module.
 */
import { z } from 'zod';

const clientSchema = z.object({
  NEXT_PUBLIC_STELLAR_NETWORK: z.enum(['mainnet', 'testnet']).default('testnet'),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional().or(z.literal('')),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal('')),
  NEXT_PUBLIC_OFFRAMP_ENABLED: z.string().optional(),
  NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string().optional(),
});

const serverSchema = z.object({
  API_SECRET_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
});

function parseClient() {
  return clientSchema.parse({
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_OFFRAMP_ENABLED: process.env.NEXT_PUBLIC_OFFRAMP_ENABLED,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  });
}

function parseServer() {
  if (typeof window !== 'undefined') return {} as z.infer<typeof serverSchema>;
  return serverSchema.parse({
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  });
}

export const env = {
  ...parseClient(),
  ...parseServer(),
};

export function isOfframpEnabled(): boolean {
  return env.NEXT_PUBLIC_OFFRAMP_ENABLED === 'true';
}
