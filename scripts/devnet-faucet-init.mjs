/**
 * @agent-context One-shot: initialize the WIBE Wheel faucet pool on devnet.
 * Run AFTER deploying the program with init_faucet/spin_wheel and AFTER funding the casino vault
 * with at least <amount> WIBE (so faucet credits stay solvent on withdraw).
 *
 * Usage:
 *   pnpm devnet:faucet            # initial pool = 3333 WIBE
 *   pnpm devnet:faucet 5000       # custom pool
 *
 * Fund the vault first (0-decimals mint → 3333 = 3333 WIBE):
 *   spl-token transfer <MINT> 3333 <CASINO_VAULT_ATA> --url devnet --fund-recipient --allow-unfunded-recipient
 * (vault address is printed below)
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import anchor from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey, SystemProgram } from '@solana/web3.js'

const { AnchorProvider, BN, Program, Wallet } = anchor

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadDotEnv(path.join(ROOT, '.env'))

const RPC = process.env.NUXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const PROGRAM_ID = new PublicKey(process.env.NUXT_PUBLIC_CASINO_PROGRAM_ID)
const MINT = new PublicKey(process.env.NUXT_PUBLIC_CASINO_TOKEN_MINT)
const AMOUNT = Number(process.argv[2] ?? 3333)
const KEYPAIR_PATH = (process.env.ANCHOR_WALLET ?? '~/.config/solana/id.json').replace(/^~/, os.homedir())

function pda(seeds) {
  return PublicKey.findProgramAddressSync(seeds, PROGRAM_ID)[0]
}

async function main() {
  const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(KEYPAIR_PATH, 'utf8'))))
  const conn = new Connection(RPC, 'confirmed')
  const provider = new AnchorProvider(conn, new Wallet(payer), { commitment: 'confirmed' })
  const idl = { ...JSON.parse(fs.readFileSync(path.join(ROOT, 'types/idl/wibe_casino.json'), 'utf8')), address: PROGRAM_ID.toBase58() }
  const program = new Program(idl, provider)

  const casinoConfig = pda([Buffer.from('casino_config'), MINT.toBuffer()])
  const casinoVault = pda([Buffer.from('casino_vault'), casinoConfig.toBuffer()])
  const faucetConfig = pda([Buffer.from('faucet_config'), casinoConfig.toBuffer()])

  console.log('[faucet] vault (fund this with WIBE):', casinoVault.toBase58())
  console.log('[faucet] faucet_config:', faucetConfig.toBase58())

  if (await conn.getAccountInfo(faucetConfig)) {
    console.log('[faucet] already initialized — done.')
    return
  }

  const sig = await program.methods
    .initFaucet(new BN(AMOUNT))
    .accountsStrict({ authority: payer.publicKey, casinoConfig, faucetConfig, systemProgram: SystemProgram.programId })
    .rpc()

  console.log(`[faucet] ✅ initialized pool = ${AMOUNT} WIBE · tx ${sig}`)
}

main().catch((e) => {
  console.error('[faucet]', e.message ?? e)
  process.exit(1)
})
