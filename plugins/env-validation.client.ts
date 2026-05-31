/**
 * @agent-context Client-only env check. FUN mode (default) needs NO chain config, so missing
 * NUXT_PUBLIC_* must NOT block the app — it only disables LIVE mode (gated by
 * useCasinoProgram().isConfigured). We warn instead of showing a fatal screen. A fatal screen is
 * raised ONLY when env is PARTIALLY set (a real misconfiguration), not when it's entirely empty.
 * @depends tests/helpers/env-contract.ts (same zod schema, used by `pnpm test:env`)
 */
import { showError } from '#app'
import { validatePublicEnv } from '~/shared/env-contract'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const raw = {
    NUXT_PUBLIC_SOLANA_NETWORK: config.public.solanaNetwork as string,
    NUXT_PUBLIC_SOLANA_RPC_URL: config.public.solanaRpcUrl as string,
    NUXT_PUBLIC_CASINO_PROGRAM_ID: config.public.casinoProgramId as string,
    NUXT_PUBLIC_CASINO_TOKEN_MINT: config.public.casinoTokenMint as string,
  }

  const result = validatePublicEnv(raw)
  if (result.ok) return

  const anySet = Object.values(raw).some(v => Boolean(v))

  // Entirely empty (e.g. FUN-only deploy without env) → app stays usable in FUN mode.
  if (!anySet) {
    console.warn('[env-validation] no chain env set — FUN mode only; LIVE disabled.')
    return
  }

  // Partially configured → genuine misconfiguration, surface it.
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
