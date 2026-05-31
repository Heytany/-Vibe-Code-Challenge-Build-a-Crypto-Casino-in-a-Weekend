/**
 * @agent-context PDA helpers for wibe_casino — seeds must match programs/wibe-casino/src/lib.rs.
 */
import { PublicKey } from '@solana/web3.js'

const CASINO_CONFIG_SEED = Buffer.from('casino_config')
const CASINO_VAULT_SEED = Buffer.from('casino_vault')
const USER_BALANCE_SEED = Buffer.from('user_balance')

export function findCasinoConfigPda(mint: PublicKey, programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [CASINO_CONFIG_SEED, mint.toBuffer()],
    programId,
  )
  return pda
}

export function findCasinoVaultPda(casinoConfig: PublicKey, programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [CASINO_VAULT_SEED, casinoConfig.toBuffer()],
    programId,
  )
  return pda
}

export function findUserBalancePda(
  casinoConfig: PublicKey,
  user: PublicKey,
  programId: PublicKey,
): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [USER_BALANCE_SEED, casinoConfig.toBuffer(), user.toBuffer()],
    programId,
  )
  return pda
}
