/**
 * @agent-context Client-only env validation — access denied screen if NUXT_PUBLIC_* invalid.
 * @depends tests/helpers/env-contract.ts (same zod schema)
 */
import { showError } from '#app'
import { validatePublicEnv } from '~/shared/env-contract'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const result = validatePublicEnv({
    NUXT_PUBLIC_SOLANA_NETWORK: config.public.solanaNetwork as string,
    NUXT_PUBLIC_SOLANA_RPC_URL: config.public.solanaRpcUrl as string,
    NUXT_PUBLIC_CASINO_PROGRAM_ID: config.public.casinoProgramId as string,
    NUXT_PUBLIC_CASINO_TOKEN_MINT: config.public.casinoTokenMint as string,
  })

  if (result.ok) return

  console.error('[env-validation]', result.issues)

  showError(
    createError({
      statusCode: 503,
      statusMessage: 'ENV_INVALID',
      message: result.issues.map(i => `${i.path}: ${i.message}`).join('; '),
      fatal: true,
    }),
  )
})
