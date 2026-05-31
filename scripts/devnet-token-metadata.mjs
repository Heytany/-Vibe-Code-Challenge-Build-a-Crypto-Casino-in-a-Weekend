/**
 * @agent-context One-shot: add Metaplex metadata so Phantom shows "WIBE" instead of "Unknown Token".
 * Run once per mint (skip if metadata account already exists).
 *
 * Usage:
 *   NUXT_PUBLIC_CASINO_TOKEN_MINT=He66se... pnpm devnet:token-meta
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const RPC = process.env.NUXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const MINT = process.env.NUXT_PUBLIC_CASINO_TOKEN_MINT
  ?? process.env.TOKEN_MINT
  ?? 'He66seATY4XobvcwC8WZceMH3uncAqEx44T8HtLyttox'
const KEYPAIR_PATH = (process.env.ANCHOR_WALLET ?? '~/.config/solana/id.json').replace(/^~/, os.homedir())

function loadKeypair(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  return Keypair.fromSecretKey(Uint8Array.from(raw))
}

async function main() {
  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Deploy keypair missing: ${KEYPAIR_PATH}`)
  }

  const payer = loadKeypair(KEYPAIR_PATH)
  const conn = new Connection(RPC, 'confirmed')
  const mint = new PublicKey(MINT)

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID,
  )

  if (await conn.getAccountInfo(metadataPda)) {
    console.log(`[devnet:token-meta] metadata already exists: ${metadataPda.toBase58()}`)
    console.log('   Phantom should show Brutal WIBE (WIBE) after refresh.')
    return
  }

  const ix = createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPda,
      mint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: 'Brutal WIBE',
          symbol: 'WIBE',
          uri: '',
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      },
    },
  )

  const tx = new Transaction().add(ix)
  const sig = await conn.sendTransaction(tx, [payer])
  await conn.confirmTransaction(sig, 'confirmed')

  console.log('[devnet:token-meta] ✅ metadata created')
  console.log(`   mint: ${mint.toBase58()}`)
  console.log(`   metadata: ${metadataPda.toBase58()}`)
  console.log(`   tx: ${sig}`)
  console.log('   → reopen Phantom — token should show as WIBE (devnet)')
}

main().catch((err) => {
  console.error('[devnet:token-meta]', err.message ?? err)
  process.exit(1)
})
