/**
 * @agent-context Zod schema for all NUXT_PUBLIC_* env vars. Used by env-validation plugin and test:env.
 * @depends .env.example
 * @failure-modes: Missing key → ENV_INVALID with variable name; invalid URL → RPC parse error
 */
import { z } from 'zod'

export const publicEnvSchema = z.object({
  NUXT_PUBLIC_SOLANA_NETWORK: z.enum(['devnet', 'localnet', 'mainnet-beta']),
  NUXT_PUBLIC_SOLANA_RPC_URL: z.string().url(),
  NUXT_PUBLIC_CASINO_PROGRAM_ID: z
    .string()
    .min(32, 'NUXT_PUBLIC_CASINO_PROGRAM_ID must be a base58 public key'),
  NUXT_PUBLIC_CASINO_TOKEN_MINT: z
    .string()
    .min(32, 'NUXT_PUBLIC_CASINO_TOKEN_MINT must be a base58 public key'),
})

export type PublicEnv = z.infer<typeof publicEnvSchema>

export const ENV_EXAMPLE_KEYS = [
  'NUXT_PUBLIC_SOLANA_NETWORK',
  'NUXT_PUBLIC_SOLANA_RPC_URL',
  'NUXT_PUBLIC_CASINO_PROGRAM_ID',
  'NUXT_PUBLIC_CASINO_TOKEN_MINT',
  'ANCHOR_WALLET',
] as const

export function parsePublicEnv(raw: Record<string, string | undefined>): PublicEnv {
  return publicEnvSchema.parse({
    NUXT_PUBLIC_SOLANA_NETWORK: raw.NUXT_PUBLIC_SOLANA_NETWORK,
    NUXT_PUBLIC_SOLANA_RPC_URL: raw.NUXT_PUBLIC_SOLANA_RPC_URL,
    NUXT_PUBLIC_CASINO_PROGRAM_ID: raw.NUXT_PUBLIC_CASINO_PROGRAM_ID,
    NUXT_PUBLIC_CASINO_TOKEN_MINT: raw.NUXT_PUBLIC_CASINO_TOKEN_MINT,
  })
}

export function validatePublicEnv(raw: Record<string, string | undefined>) {
  const result = publicEnvSchema.safeParse({
    NUXT_PUBLIC_SOLANA_NETWORK: raw.NUXT_PUBLIC_SOLANA_NETWORK,
    NUXT_PUBLIC_SOLANA_RPC_URL: raw.NUXT_PUBLIC_SOLANA_RPC_URL,
    NUXT_PUBLIC_CASINO_PROGRAM_ID: raw.NUXT_PUBLIC_CASINO_PROGRAM_ID,
    NUXT_PUBLIC_CASINO_TOKEN_MINT: raw.NUXT_PUBLIC_CASINO_TOKEN_MINT,
  })

  if (result.success) {
    return { ok: true as const, data: result.data }
  }

  const issues = result.error.issues.map(issue => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

  return { ok: false as const, issues }
}
