/**
 * @agent-context WIBE Wheel faucet — free spin that credits the player's casino balance from a
 * shared on-chain pool (`faucet_config`). 24h cooldown per wallet, skewed prize 1..1000. NOT a paid
 * game and NOT provably-fair-verified. Additive: does not touch dice/slot/deposit flows.
 * @see programs/wibe-casino/src/lib.rs (spin_wheel), ai/specs/post-release-wheel-faucet.md
 */
import { AnchorProvider, BN, EventParser, Program, type Idl } from '@coral-xyz/anchor'
import { PublicKey, SYSVAR_RECENT_BLOCKHASHES_PUBKEY, SystemProgram } from '@solana/web3.js'
import idlJson from '~/types/idl/wibe_casino.json'
import { findCasinoConfigPda, findFaucetClaimPda, findFaucetConfigPda, findUserBalancePda } from '~/shared/casino-pdas'
import { WibeError, WibeErrorCode } from '~/shared/errors'

const COOLDOWN_MS = 86_400_000

const faucetRemaining = ref<number | null>(null)
const lastClaim = ref<number | null>(null) // unix seconds, 0 = never
const spinning = ref(false)
const lastPrize = ref<number | null>(null)
// Phantom fires no event when the user just *hides* the approve popup (neither approve
// nor reject), so .rpc() hangs forever. This lets the UI abandon a pending sign and
// un-stick the loading state — safe, because nothing is signed/sent until approval.
let cancelPending: ((err: Error) => void) | null = null

function randomU64Bn(): BN {
  const buf = new BigUint64Array(1)
  crypto.getRandomValues(buf)
  return new BN(buf[0]!.toString())
}

export function useWheel() {
  const { connected, publicKey, connection, signTransaction, signAllTransactions, requirePublicKey } = useWallet()
  const casino = useCasinoProgram()

  const programIdStr = computed(() => casino.programId.value as string)
  const tokenMintStr = computed(() => casino.tokenMint.value as string)

  function getProgram(): Program {
    const conn = connection.value
    if (!conn) throw new WibeError(WibeErrorCode.RpcUnreachable)
    const wallet = { publicKey: requirePublicKey(), signTransaction, signAllTransactions }
    const provider = new AnchorProvider(conn, wallet, { commitment: 'confirmed', preflightCommitment: 'confirmed' })
    const programId = new PublicKey(programIdStr.value)
    const idl = { ...(idlJson as Idl), address: programId.toBase58() }
    return new Program(idl, provider)
  }

  function accounts() {
    const programId = new PublicKey(programIdStr.value)
    const mint = new PublicKey(tokenMintStr.value)
    const user = requirePublicKey()
    const casinoConfig = findCasinoConfigPda(mint, programId)
    const faucetConfig = findFaucetConfigPda(casinoConfig, programId)
    const faucetClaim = findFaucetClaimPda(casinoConfig, user, programId)
    const userBalance = findUserBalancePda(casinoConfig, user, programId)
    return { programId, user, casinoConfig, faucetConfig, faucetClaim, userBalance }
  }

  function fromBase(n: number): number {
    const d = casino.tokenDecimals.value || 0
    return d ? n / 10 ** d : n
  }

  async function refreshFaucet() {
    if (!connected.value || !publicKey.value || !casino.isConfigured.value) {
      faucetRemaining.value = null
      lastClaim.value = null
      return
    }
    try {
      const program = getProgram()
      const { faucetConfig, faucetClaim } = accounts()
      const cfg = await (program.account as any).faucetConfig.fetchNullable(faucetConfig)
      faucetRemaining.value = cfg ? fromBase(Number(cfg.remaining)) : 0
      const claim = await (program.account as any).faucetClaim.fetchNullable(faucetClaim)
      lastClaim.value = claim ? Number(claim.lastClaim) : 0
    } catch {
      faucetRemaining.value = null
      lastClaim.value = null
    }
  }

  const cooldownUntil = computed(() =>
    lastClaim.value && lastClaim.value > 0 ? lastClaim.value * 1000 + COOLDOWN_MS : 0,
  )
  const onCooldown = computed(() => cooldownUntil.value > Date.now())
  const poolEmpty = computed(() => faucetRemaining.value !== null && faucetRemaining.value <= 0)
  const canSpin = computed(() =>
    connected.value && casino.isConfigured.value && !spinning.value && !onCooldown.value && !poolEmpty.value,
  )

  async function spin(): Promise<number> {
    if (!connected.value) throw new WibeError(WibeErrorCode.WalletNotConnected)
    spinning.value = true
    lastPrize.value = null
    // resolved if the user gives up on a hidden popup; rejects the race so we stop waiting
    const aborted = new Promise<never>((_, reject) => {
      cancelPending = reject
    })
    try {
      const program = getProgram()
      const { programId, user, casinoConfig, faucetConfig, faucetClaim, userBalance } = accounts()
      const signature = (await Promise.race([
        program.methods
          .spinWheel(randomU64Bn())
          .accountsStrict({
            user,
            casinoConfig,
            faucetConfig,
            faucetClaim,
            userBalance,
            recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
            systemProgram: SystemProgram.programId,
          })
          .rpc(),
        aborted,
      ])) as string

      let prize = 0
      const tx = await connection.value!.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      })
      const parser = new EventParser(programId, program.coder)
      for (const ev of parser.parseLogs(tx?.meta?.logMessages ?? [])) {
        if (ev.name.toLowerCase() === 'wheelspun') prize = fromBase(Number((ev.data as { prize: number }).prize))
      }
      lastPrize.value = prize
      await casino.refreshBalance()
      await refreshFaucet()
      return prize
    } catch (err) {
      if (err instanceof WibeError) {
        // a cancelled (abandoned) sign may still land if the user approved late — re-sync
        if (err.code === WibeErrorCode.WalletRejected) void refreshFaucet()
        throw err
      }
      const msg = err instanceof Error ? err.message : String(err)
      if (/FaucetCooldown/i.test(msg)) throw new WibeError(WibeErrorCode.TransactionFailed, 'Wheel is on cooldown — come back later.')
      if (/FaucetEmpty/i.test(msg)) throw new WibeError(WibeErrorCode.TransactionFailed, 'Prize pool is empty.')
      if (/rejected/i.test(msg)) throw new WibeError(WibeErrorCode.WalletRejected)
      throw new WibeError(WibeErrorCode.TransactionFailed, msg)
    } finally {
      cancelPending = null
      spinning.value = false
    }
  }

  /** Un-stick a spin whose approve popup was hidden without approve/reject. */
  function cancelSpin() {
    cancelPending?.(new WibeError(WibeErrorCode.WalletRejected, 'Spin cancelled — nothing was sent.'))
  }

  return {
    faucetRemaining: readonly(faucetRemaining),
    lastClaim: readonly(lastClaim),
    cooldownUntil,
    onCooldown,
    poolEmpty,
    canSpin,
    spinning: readonly(spinning),
    lastPrize: readonly(lastPrize),
    isConfigured: casino.isConfigured,
    refreshFaucet,
    spin,
    cancelSpin,
  }
}
