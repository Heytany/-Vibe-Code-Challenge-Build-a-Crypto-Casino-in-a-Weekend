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
  getAssociatedTokenAddressSync,
  getMint,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
} from '@solana/web3.js'
import idlJson from '~/types/idl/wibe_casino.json'
import { isRealChainConfig } from '~/shared/casino-env'
import {
  findCasinoConfigPda,
  findCasinoVaultPda,
  findUserBalancePda,
} from '~/shared/casino-pdas'
import { WibeError, WibeErrorCode } from '~/shared/errors'

const casinoBalance = ref<number | null>(null)
const loading = ref(false)
const tokenDecimals = ref<number>(0)

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
  return new WibeError(WibeErrorCode.TransactionFailed, msg)
}

function decodeUserBalance(
  program: Program,
  data: Buffer,
): { amount: BN, gameNonce: BN } {
  return program.coder.accounts.decode('UserBalance', data) as { amount: BN, gameNonce: BN }
}

async function fetchUserBalanceAccount(
  program: Program,
  userBalancePda: PublicKey,
): Promise<{ amount: BN, gameNonce: BN } | null> {
  const info = await program.provider.connection.getAccountInfo(userBalancePda)
  if (!info?.data) return null
  return decodeUserBalance(program, Buffer.from(info.data))
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

  async function refreshBalance() {
    if (!connected.value || !publicKey.value) {
      casinoBalance.value = null
      return
    }

    if (!isConfigured.value) {
      casinoBalance.value = null
      return
    }

    loading.value = true
    try {
      await ensureTokenDecimals()
      const program = getProgram()
      const { userBalance } = getAccounts()
      const acc = await fetchUserBalanceAccount(program, userBalance)
      casinoBalance.value = acc ? fromBaseUnits(acc.amount) : 0
    } catch (err) {
      throw mapAnchorError(err)
    } finally {
      loading.value = false
    }
  }

  async function deposit(amount: number) {
    assertConfigured()
    if (amount <= 0) throw new WibeError(WibeErrorCode.InvalidBet)

    try {
      await ensureTokenDecimals()
      const program = getProgram()
      const conn = connection.value!
      const { mint, user, casinoConfig, casinoVault, userBalance } = getAccounts()
      const userAta = getAssociatedTokenAddressSync(mint, user)
      const baseAmount = toBaseUnits(amount)

      const ataInfo = await conn.getAccountInfo(userAta)
      const preInstructions = ataInfo
        ? []
        : [createAssociatedTokenAccountInstruction(user, userAta, user, mint)]

      await program.methods
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
        .rpc()

      await refreshBalance()
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
      const { mint, user, casinoConfig, casinoVault, userBalance } = getAccounts()
      const userAta = getAssociatedTokenAddressSync(mint, user)
      const baseAmount = toBaseUnits(amount)

      await program.methods
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

      await refreshBalance()
    } catch (err) {
      throw mapAnchorError(err)
    }
  }

  async function parseTxBlockhash(signature: string): Promise<string> {
    const conn = connection.value
    if (!conn) throw new WibeError(WibeErrorCode.RpcUnreachable)

    const tx = await conn.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    const blockhash = tx?.transaction.message.recentBlockhash
    if (!blockhash) {
      throw new WibeError(WibeErrorCode.TransactionFailed, 'Could not read tx blockhash')
    }
    return blockhash
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

      const blockhashBase58 = await parseTxBlockhash(signature)

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

      await refreshBalance()

      return {
        signature,
        roll,
        won,
        userSeed: BigInt(userSeedBn.toString()),
        nonce: nonceUsed,
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

      const blockhashBase58 = await parseTxBlockhash(signature)

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

      await refreshBalance()

      return {
        signature,
        reels,
        multiplier,
        won,
        userSeed: BigInt(userSeedBn.toString()),
        nonce: nonceUsed,
        blockhashBase58,
        bet,
      }
    } catch (err) {
      throw mapAnchorError(err)
    }
  }

  watch([connected, publicKey, isConfigured], () => {
    if (connected.value && isConfigured.value) {
      refreshBalance().catch(() => {})
    } else {
      casinoBalance.value = null
    }
  })

  return {
    programId: programIdStr,
    tokenMint: tokenMintStr,
    isConfigured,
    tokenDecimals: readonly(tokenDecimals),
    casinoBalance: readonly(casinoBalance),
    loading: readonly(loading),
    refreshBalance,
    deposit,
    withdraw,
    playDice,
    playSlot,
  }
}
