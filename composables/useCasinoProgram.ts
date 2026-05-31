/**
 * @agent-context Single entry point to wibe_casino Anchor program on frontend.
 * @depends NUXT_PUBLIC_CASINO_PROGRAM_ID, types/idl/wibe_casino.json (sync via pnpm copy-idl)
 * @see ai/specs/game-dice.md, ai/AGENT_ONBOARDING.md (deploy flow)
 * @failure-modes: PROGRAM_NOT_CONFIGURED; RPC_UNREACHABLE; IDL missing
 */
import { AnchorProvider, BN, EventParser, Program } from '@coral-xyz/anchor'
import type { Idl } from '@coral-xyz/anchor'
import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
  type Connection,
} from '@solana/web3.js'
import idlJson from '~/types/idl/wibe_casino.json'
import { isRealChainConfig } from '~/shared/casino-env'
import {
  findCasinoConfigPda,
  findCasinoVaultPda,
  findUserBalancePda,
} from '~/shared/casino-pdas'
import { base58Encode } from '~/shared/rng-verify'
import { WibeError, WibeErrorCode } from '~/shared/errors'

const casinoBalance = ref<number | null>(null)
const walletTokenBalance = ref<number | null>(null)
const loading = ref(false)
const tokenDecimals = ref<number>(0)
let balanceWatchRegistered = false

export interface PlayDiceParams {
  bet: number
  target: number
  rollUnder: boolean
  userSeed?: bigint
}

export interface PlayDiceResult {
  signature: string
  roll: number
  won: boolean
  userSeed: bigint
  nonce: bigint
  /** First 32 bytes of RecentBlockhashes sysvar — same input the program hashes. */
  blockhash: Uint8Array
  blockhashBase58: string
  rollUnder: boolean
  target: number
  bet: number
}

export interface PlaySlotParams {
  bet: number
  userSeed?: bigint
}

export interface PlaySlotResult {
  signature: string
  reels: [number, number, number]
  multiplier: number
  won: boolean
  userSeed: bigint
  nonce: bigint
  blockhash: Uint8Array
  blockhashBase58: string
  bet: number
}

function mapAnchorError(err: unknown): WibeError {
  if (err instanceof WibeError) return err

  const msg = err instanceof Error ? err.message : String(err)
  if (/InsufficientBalance|Insufficient balance/i.test(msg)) {
    return new WibeError(WibeErrorCode.InsufficientBalance)
  }
  if (/InvalidBet|Invalid bet/i.test(msg)) {
    return new WibeError(WibeErrorCode.InvalidBet)
  }
  if (/User rejected|rejected/i.test(msg)) {
    return new WibeError(WibeErrorCode.WalletRejected)
  }
  if (/InstructionFallbackNotFound|Fallback functions are not supported|Error Number: 101/i.test(msg)) {
    return new WibeError(
      WibeErrorCode.TransactionFailed,
      'Play instruction rejected by program (IDL mismatch). Rebuild IDL: pnpm anchor:build && pnpm copy-idl.',
    )
  }
  if (/AccountNotFound|account not found|does not exist/i.test(msg)) {
    if (/UserBalance|user_balance|user balance/i.test(msg)) {
      return new WibeError(WibeErrorCode.DepositRequired)
    }
    if (/CasinoConfig|casino_config/i.test(msg)) {
      return new WibeError(WibeErrorCode.CasinoNotInitialized)
    }
  }
  return new WibeError(WibeErrorCode.TransactionFailed, msg)
}

function decodeUserBalance(
  program: Program,
  data: Buffer,
): { amount: BN, gameNonce: BN } {
  return program.coder.accounts.decode('UserBalance', data) as { amount: BN, gameNonce: BN }
}

/** Raw read — fallback when Anchor decode fails (IDL / discriminator mismatch). */
function readUserBalanceAmountRaw(data: Uint8Array): BN | null {
  if (data.length < 16) return null
  return new BN(Buffer.from(data.subarray(8, 16)), 'le')
}

async function fetchUserBalanceAccount(
  program: Program,
  userBalancePda: PublicKey,
): Promise<{ amount: BN, gameNonce: BN } | null> {
  const info = await program.provider.connection.getAccountInfo(userBalancePda)
  if (!info?.data) return null
  const buf = Buffer.from(info.data)
  try {
    return decodeUserBalance(program, buf)
  } catch {
    const amount = readUserBalanceAmountRaw(info.data)
    if (!amount) return null
    const gameNonce = info.data.length >= 24
      ? new BN(Buffer.from(info.data.subarray(16, 24)), 'le')
      : new BN(0)
    return { amount, gameNonce }
  }
}

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function confirmSignature(conn: Connection, signature: string) {
  const latest = await conn.getLatestBlockhash('confirmed')
  await conn.confirmTransaction(
    { signature, ...latest },
    'confirmed',
  )
}

function randomU64Bn(): BN {
  const buf = new BigUint64Array(1)
  crypto.getRandomValues(buf)
  return new BN(buf[0]!.toString())
}

export function useCasinoProgram() {
  const config = useRuntimeConfig()
  const {
    connected,
    publicKey,
    connection,
    signTransaction,
    signAllTransactions,
    requirePublicKey,
  } = useWallet()

  const programIdStr = computed(() => config.public.casinoProgramId as string)
  const tokenMintStr = computed(() => config.public.casinoTokenMint as string)
  const isConfigured = computed(() =>
    isRealChainConfig(programIdStr.value, tokenMintStr.value),
  )

  function assertConfigured() {
    if (!isConfigured.value) {
      throw new WibeError(WibeErrorCode.ProgramNotConfigured)
    }
  }

  function getProgram(): Program {
    assertConfigured()
    const conn = connection.value
    if (!conn) {
      throw new WibeError(WibeErrorCode.RpcUnreachable)
    }

    const userPk = requirePublicKey()
    const wallet = {
      publicKey: userPk,
      signTransaction,
      signAllTransactions,
    }
    const provider = new AnchorProvider(conn, wallet, {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    })

    const programId = new PublicKey(programIdStr.value)
    const idl = { ...(idlJson as Idl), address: programId.toBase58() }
    return new Program(idl, provider)
  }

  function getAccounts() {
    const programId = new PublicKey(programIdStr.value)
    const mint = new PublicKey(tokenMintStr.value)
    const user = requirePublicKey()
    const casinoConfig = findCasinoConfigPda(mint, programId)
    const casinoVault = findCasinoVaultPda(casinoConfig, programId)
    const userBalance = findUserBalancePda(casinoConfig, user, programId)
    return { programId, mint, user, casinoConfig, casinoVault, userBalance }
  }

  async function ensureTokenDecimals() {
    if (tokenDecimals.value > 0 || !isConfigured.value) return
    const conn = connection.value
    if (!conn) return
    try {
      const mint = await getMint(conn, new PublicKey(tokenMintStr.value))
      tokenDecimals.value = mint.decimals
    } catch {
      tokenDecimals.value = 0
    }
  }

  function toBaseUnits(amount: number): BN {
    const scale = 10 ** tokenDecimals.value
    return new BN(Math.round(amount * scale))
  }

  function fromBaseUnits(amount: BN): number {
    const scale = 10 ** tokenDecimals.value
    return amount.toNumber() / scale
  }

  async function refreshWalletBalance() {
    if (!connected.value || !publicKey.value || !isConfigured.value) {
      walletTokenBalance.value = null
      return
    }

    const conn = connection.value
    if (!conn) {
      walletTokenBalance.value = 0
      return
    }

    try {
      await ensureTokenDecimals()
      const { mint, user } = getAccounts()
      const userAta = getAssociatedTokenAddressSync(mint, user)
      const acc = await getAccount(conn, userAta)
      walletTokenBalance.value = fromBaseUnits(new BN(acc.amount.toString()))
    } catch {
      walletTokenBalance.value = 0
    }
  }

  async function fetchCasinoBalanceSafe(): Promise<number> {
    if (!connected.value || !publicKey.value || !isConfigured.value) {
      return 0
    }
    try {
      await ensureTokenDecimals()
      const program = getProgram()
      const { userBalance } = getAccounts()
      const acc = await fetchUserBalanceAccount(program, userBalance)
      return acc ? fromBaseUnits(acc.amount) : 0
    } catch {
      return 0
    }
  }

  async function refreshBalance() {
    if (!connected.value || !publicKey.value) {
      casinoBalance.value = null
      walletTokenBalance.value = null
      return
    }

    if (!isConfigured.value) {
      casinoBalance.value = null
      walletTokenBalance.value = null
      return
    }

    loading.value = true
    try {
      casinoBalance.value = await fetchCasinoBalanceSafe()
      await refreshWalletBalance()
    } catch (err) {
      casinoBalance.value = 0
      walletTokenBalance.value = 0
      console.warn('[useCasinoProgram] refreshBalance failed', err)
    } finally {
      loading.value = false
    }
  }

  async function refreshBalanceAfterTx(signature?: string) {
    const conn = connection.value
    if (signature && conn) {
      try {
        await confirmSignature(conn, signature)
      } catch (err) {
        console.warn('[useCasinoProgram] confirmTransaction', err)
      }
    }

    for (const delay of [0, 300, 600, 1200]) {
      if (delay > 0) await sleep(delay)
      await refreshBalance()
    }
  }

  async function assertCasinoReady(program: Program) {
    const { casinoConfig } = getAccounts()
    const info = await program.provider.connection.getAccountInfo(casinoConfig)
    if (!info) {
      throw new WibeError(WibeErrorCode.CasinoNotInitialized)
    }
  }

  async function assertUserBalanceExists(program: Program) {
    const { userBalance } = getAccounts()
    const info = await program.provider.connection.getAccountInfo(userBalance)
    if (!info) {
      throw new WibeError(WibeErrorCode.DepositRequired)
    }
  }

  async function deposit(amount: number) {
    assertConfigured()
    if (amount <= 0) throw new WibeError(WibeErrorCode.InvalidBet)

    try {
      await ensureTokenDecimals()
      const program = getProgram()
      await assertCasinoReady(program)
      const conn = connection.value!
      const { mint, user, casinoConfig, casinoVault, userBalance } = getAccounts()
      const userAta = getAssociatedTokenAddressSync(mint, user)
      const baseAmount = toBaseUnits(amount)

      const ataInfo = await conn.getAccountInfo(userAta)
      const preInstructions = ataInfo
        ? []
        : [createAssociatedTokenAccountInstruction(user, userAta, user, mint)]

      const userBalanceExists = !!(await conn.getAccountInfo(userBalance))

      const builder = program.methods
        .deposit(baseAmount)
        .accountsStrict({
          user,
          casinoConfig,
          casinoVault,
          userTokenAccount: userAta,
          userBalance,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .preInstructions(preInstructions)

      let signature: string
      try {
        signature = await builder.rpc()
      } catch (firstErr) {
        if (userBalanceExists) throw firstErr
        console.warn('[useCasinoProgram] deposit preflight failed, retry skipPreflight', firstErr)
        signature = await builder.rpc({ skipPreflight: true })
      }

      await refreshBalanceAfterTx(signature)
      return signature
    } catch (err) {
      throw mapAnchorError(err)
    }
  }

  async function withdraw(amount: number) {
    assertConfigured()
    if (amount <= 0) throw new WibeError(WibeErrorCode.InvalidBet)

    try {
      await ensureTokenDecimals()
      const program = getProgram()
      await assertUserBalanceExists(program)
      const { mint, user, casinoConfig, casinoVault, userBalance } = getAccounts()
      const userAta = getAssociatedTokenAddressSync(mint, user)
      const baseAmount = toBaseUnits(amount)

      const signature = await program.methods
        .withdraw(baseAmount)
        .accountsStrict({
          user,
          casinoConfig,
          casinoVault,
          userTokenAccount: userAta,
          userBalance,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc()

      await refreshBalanceAfterTx(signature)
      return signature
    } catch (err) {
      throw mapAnchorError(err)
    }
  }

  async function fetchRngBlockhashBytes(): Promise<Uint8Array> {
    const conn = connection.value
    if (!conn) throw new WibeError(WibeErrorCode.RpcUnreachable)

    const info = await conn.getAccountInfo(SYSVAR_RECENT_BLOCKHASHES_PUBKEY)
    if (!info?.data || info.data.length < 32) {
      throw new WibeError(WibeErrorCode.TransactionFailed, 'Could not read recent blockhashes sysvar')
    }
    return info.data.slice(0, 32)
  }

  async function playDice(params: PlayDiceParams): Promise<PlayDiceResult> {
    assertConfigured()
    const { bet, target, rollUnder } = params
    if (bet <= 0 || target < 2 || target > 98) {
      throw new WibeError(WibeErrorCode.InvalidBet)
    }

    try {
      await ensureTokenDecimals()
      const program = getProgram()
      await assertCasinoReady(program)
      await assertUserBalanceExists(program)
      const { programId, user, casinoConfig, userBalance } = getAccounts()
      const userSeedBn = params.userSeed !== undefined
        ? new BN(params.userSeed.toString())
        : randomU64Bn()

      const before = await fetchUserBalanceAccount(program, userBalance)
      const nonceUsed = before ? BigInt(before.gameNonce.toString()) : 0n

      const signature = await program.methods
        .playDice(toBaseUnits(bet), rollUnder, target, userSeedBn)
        .accountsStrict({
          user,
          casinoConfig,
          userBalance,
          recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        })
        .rpc()

      const blockhashBytes = await fetchRngBlockhashBytes()
      const blockhashBase58 = base58Encode(blockhashBytes)

      const tx = await connection.value!.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      })
      const logs = tx?.meta?.logMessages ?? []
      const parser = new EventParser(programId, program.coder)
      let roll = 0
      let won = false

      for (const ev of parser.parseLogs(logs)) {
        if (ev.name === 'DicePlayed') {
          const data = ev.data as { roll: number, won: boolean }
          roll = data.roll
          won = data.won
        }
      }

      await refreshBalanceAfterTx(signature)

      return {
        signature,
        roll,
        won,
        userSeed: BigInt(userSeedBn.toString()),
        nonce: nonceUsed,
        blockhash: blockhashBytes,
        blockhashBase58,
        rollUnder,
        target,
        bet,
      }
    } catch (err) {
      throw mapAnchorError(err)
    }
  }

  async function playSlot(params: PlaySlotParams): Promise<PlaySlotResult> {
    assertConfigured()
    const { bet } = params
    if (bet <= 0) throw new WibeError(WibeErrorCode.InvalidBet)

    try {
      await ensureTokenDecimals()
      const program = getProgram()
      await assertCasinoReady(program)
      await assertUserBalanceExists(program)
      const { programId, user, casinoConfig, userBalance } = getAccounts()
      const userSeedBn = params.userSeed !== undefined
        ? new BN(params.userSeed.toString())
        : randomU64Bn()

      const before = await fetchUserBalanceAccount(program, userBalance)
      const nonceUsed = before ? BigInt(before.gameNonce.toString()) : 0n

      const signature = await program.methods
        .playSlot(toBaseUnits(bet), userSeedBn)
        .accountsStrict({
          user,
          casinoConfig,
          userBalance,
          recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
        })
        .rpc()

      const blockhashBytes = await fetchRngBlockhashBytes()
      const blockhashBase58 = base58Encode(blockhashBytes)

      const tx = await connection.value!.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      })
      const logs = tx?.meta?.logMessages ?? []
      const parser = new EventParser(programId, program.coder)
      let reels: [number, number, number] = [0, 0, 0]
      let multiplier = 0
      let won = false

      for (const ev of parser.parseLogs(logs)) {
        if (ev.name === 'SlotPlayed') {
          const data = ev.data as {
            reel1: number
            reel2: number
            reel3: number
            payoutMultiplier: number
            won: boolean
          }
          reels = [data.reel1, data.reel2, data.reel3]
          multiplier = data.payoutMultiplier
          won = data.won
        }
      }

      await refreshBalanceAfterTx(signature)

      return {
        signature,
        reels,
        multiplier,
        won,
        userSeed: BigInt(userSeedBn.toString()),
        nonce: nonceUsed,
        blockhash: blockhashBytes,
        blockhashBase58,
        bet,
      }
    } catch (err) {
      throw mapAnchorError(err)
    }
  }

  if (import.meta.client && !balanceWatchRegistered) {
    watch([connected, publicKey, isConfigured], () => {
      if (connected.value && isConfigured.value) {
        refreshBalance().catch((err) => {
          console.warn('[useCasinoProgram] balance sync failed', err)
          casinoBalance.value = 0
          walletTokenBalance.value = 0
        })
      } else {
        casinoBalance.value = null
        walletTokenBalance.value = null
      }
    }, { immediate: true })
    balanceWatchRegistered = true
  }

  return {
    programId: programIdStr,
    tokenMint: tokenMintStr,
    isConfigured,
    tokenDecimals: readonly(tokenDecimals),
    casinoBalance: readonly(casinoBalance),
    walletTokenBalance: readonly(walletTokenBalance),
    loading: readonly(loading),
    refreshBalance,
    deposit,
    withdraw,
    playDice,
    playSlot,
  }
}
