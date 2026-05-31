/**
 * @agent-context One-shot **devnet-only** setup: deploy program → mint test SPL → initialize → mint demo tokens to Phantom.
 * NOT mainnet. Fake demo credits for Brutal wibe — not a real casino.
 *
 * Usage:
 *   PHANTOM_ADDRESS=6w5m... pnpm devnet:setup
 *
 * Prereq: deploy wallet (~/.config/solana/id.json) has devnet SOL (airdrop or transfer from Phantom).
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import {
  createAssociatedTokenAccountInstruction,
  createMint,
  getAssociatedTokenAddressSync,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js'
import idlJson from '../types/idl/wibe_casino.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PHANTOM = process.env.PHANTOM_ADDRESS ?? '6w5mMais6m5YX6b9KFv8QY2XqqdaRQ5FjfMuK23WJcT3'
const RPC = process.env.NUXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const KEYPAIR_PATH = (process.env.ANCHOR_WALLET ?? '~/.config/solana/id.json').replace(/^~/, os.homedir())

function loadKeypair(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  return Keypair.fromSecretKey(Uint8Array.from(raw))
}

function findCasinoConfigPda(mint, programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('casino_config'), mint.toBuffer()],
    programId,
  )[0]
}

function findCasinoVaultPda(casinoConfig, programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('casino_vault'), casinoConfig.toBuffer()],
    programId,
  )[0]
}

async function ensureDeployBalance(conn, payer) {
  const bal = await conn.getBalance(payer.publicKey)
  console.log(`[devnet-setup] deploy wallet ${payer.publicKey.toBase58()} — ${bal / 1e9} SOL`)
  if (bal >= 0.15 * anchor.web3.LAMPORTS_PER_SOL) return

  console.log('[devnet-setup] need devnet SOL on deploy wallet (~0.15+ after program deploy)')
  console.log(`  → Phantom: send ~1 devnet SOL to ${payer.publicKey.toBase58()}`)
  console.log('  → or https://faucet.solana.com once (do not retry in a loop)')
  console.log('  → check: pnpm devnet:balance <address>')
  throw new Error('Deploy wallet has insufficient devnet SOL')
}

async function main() {
  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Deploy keypair missing: ${KEYPAIR_PATH}`)
  }

  const soPath = path.join(ROOT, 'target/deploy/wibe_casino.so')
  if (!fs.existsSync(soPath)) {
    throw new Error('Missing target/deploy/wibe_casino.so — run: pnpm anchor:build')
  }

  const payer = loadKeypair(KEYPAIR_PATH)
  const conn = new Connection(RPC, 'confirmed')
  await ensureDeployBalance(conn, payer)

  const programKeypair = loadKeypair(path.join(ROOT, 'target/deploy/wibe_casino-keypair.json'))
  const programId = programKeypair.publicKey

  const programInfo = await conn.getAccountInfo(programId)
  if (!programInfo) {
    console.log('[devnet-setup] deploying program to devnet (testnet only)…')
    execSync(
      `solana program deploy target/deploy/wibe_casino.so --program-id target/deploy/wibe_casino-keypair.json --url devnet`,
      { cwd: ROOT, stdio: 'inherit' },
    )
  } else {
    console.log(`[devnet-setup] program already on devnet: ${programId.toBase58()}`)
  }

  try {
    execSync('pnpm copy-idl', { cwd: ROOT, stdio: 'inherit' })
  } catch {
    console.log('[devnet-setup] copy-idl skipped (using types/idl/wibe_casino.json)')
  }

  const wallet = new anchor.Wallet(payer)
  const provider = new anchor.AnchorProvider(conn, wallet, { commitment: 'confirmed' })
  const idl = { ...idlJson, address: programId.toBase58() }
  const program = new Program(idl, provider)

  console.log('[devnet-setup] creating test SPL mint (0 decimals, devnet-only)…')
  const mint = await createMint(conn, payer, payer.publicKey, null, 0)
  const casinoConfig = findCasinoConfigPda(mint, programId)
  const casinoVault = findCasinoVaultPda(casinoConfig, programId)

  if (!(await conn.getAccountInfo(casinoConfig))) {
    console.log('[devnet-setup] initialize(house_edge_bps=200)…')
    await program.methods
      .initialize(200)
      .accountsStrict({
        authority: payer.publicKey,
        mint,
        casinoConfig,
        casinoVault,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc()
  }

  const phantom = new PublicKey(PHANTOM)
  const phantomAta = getAssociatedTokenAddressSync(mint, phantom)
  if (!(await conn.getAccountInfo(phantomAta))) {
    const tx = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(payer.publicKey, phantomAta, phantom, mint),
    )
    await provider.sendAndConfirm(tx)
  }

  const demoAmount = 10_000
  console.log(`[devnet-setup] minting ${demoAmount} test tokens → Phantom ${PHANTOM}`)
  await mintTo(conn, payer, mint, phantomAta, payer, demoAmount)

  const envPath = path.join(ROOT, '.env')
  fs.writeFileSync(envPath, [
    '# DEVNET ONLY — demo / vibe project. NOT mainnet. NOT real money.',
    'NUXT_PUBLIC_SOLANA_NETWORK=devnet',
    `NUXT_PUBLIC_SOLANA_RPC_URL=${RPC}`,
    `NUXT_PUBLIC_CASINO_PROGRAM_ID=${programId.toBase58()}`,
    `NUXT_PUBLIC_CASINO_TOKEN_MINT=${mint.toBase58()}`,
    `ANCHOR_WALLET=${KEYPAIR_PATH.replace(os.homedir(), '~')}`,
    '',
  ].join('\n'))

  console.log('\n✅ Devnet demo ready')
  console.log(`   PROGRAM_ID=${programId.toBase58()}`)
  console.log(`   TOKEN_MINT=${mint.toBase58()}`)
  console.log(`   Phantom test tokens: ${demoAmount}`)
  console.log('   → pnpm dev')
}

main().catch((err) => {
  console.error('[devnet-setup]', err.message ?? err)
  process.exit(1)
})
