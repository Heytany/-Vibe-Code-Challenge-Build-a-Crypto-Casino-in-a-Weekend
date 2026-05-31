/**
 * Devnet deploy wallet balance check — NO airdrop, NO retries (avoid faucet/RPC bans).
 * Fund manually: Phantom → send devnet SOL, or https://faucet.solana.com once.
 */
import { Connection, PublicKey } from '@solana/web3.js'

const RPC = process.env.NUXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const address = process.argv[2]

if (!address) {
  console.error('Usage: pnpm devnet:balance <pubkey>')
  process.exit(1)
}

const conn = new Connection(RPC, { commitment: 'confirmed', disableRetryOnRateLimit: true })
const bal = await conn.getBalance(new PublicKey(address))
console.log(`${address}: ${bal / 1e9} SOL (devnet)`)

if (bal < 0.5 * 1e9) {
  console.log('\nNeed ~2.5 devnet SOL on deploy wallet for program deploy (~2.2 SOL).')
  console.log('Fund once via Phantom transfer or https://faucet.solana.com — do NOT spam requests.')
  process.exit(1)
}
