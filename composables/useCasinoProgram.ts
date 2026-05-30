/**
 * @agent-context Single entry point to wibe_casino Anchor program on frontend.
 * @depends NUXT_PUBLIC_CASINO_PROGRAM_ID, types/idl/wibe_casino.json (after anchor build)
 * @see ai/specs/game-dice.md, ai/AGENT_ONBOARDING.md (deploy flow)
 * @failure-modes: PROGRAM_NOT_CONFIGURED; RPC_UNREACHABLE; IDL missing
 */
import { WibeError, WibeErrorCode } from '~/shared/errors'

const casinoBalance = ref<number | null>(null)
const loading = ref(false)

export function useCasinoProgram() {
  const config = useRuntimeConfig()
  const { connected, publicKey, connection } = useWallet()

  const programId = computed(() => config.public.casinoProgramId as string)
  const tokenMint = computed(() => config.public.casinoTokenMint as string)
  const isConfigured = computed(() => Boolean(programId.value && tokenMint.value))

  async function refreshBalance() {
    if (!connected.value || !publicKey.value) {
      casinoBalance.value = null
      return
    }

    if (!isConfigured.value) {
      throw new WibeError(WibeErrorCode.ProgramNotConfigured)
    }

    loading.value = true
    try {
      // TODO: fetch UserBalance PDA via Anchor program.account.userBalance.fetch
      casinoBalance.value = 0
    } catch {
      throw new WibeError(WibeErrorCode.RpcUnreachable)
    } finally {
      loading.value = false
    }
  }

  async function deposit(_amount: number) {
    if (!isConfigured.value) throw new WibeError(WibeErrorCode.ProgramNotConfigured)
    // TODO: build deposit instruction, sign via Phantom
    throw new WibeError(WibeErrorCode.TransactionFailed, 'deposit() not implemented — see ai/CONTEXT.md')
  }

  async function withdraw(_amount: number) {
    if (!isConfigured.value) throw new WibeError(WibeErrorCode.ProgramNotConfigured)
    // TODO: build withdraw instruction
    throw new WibeError(WibeErrorCode.TransactionFailed, 'withdraw() not implemented — see ai/CONTEXT.md')
  }

  watch([connected, publicKey], () => {
    if (connected.value) refreshBalance().catch(() => {})
    else casinoBalance.value = null
  })

  return {
    programId,
    tokenMint,
    isConfigured,
    casinoBalance: readonly(casinoBalance),
    loading: readonly(loading),
    refreshBalance,
    deposit,
    withdraw,
  }
}
