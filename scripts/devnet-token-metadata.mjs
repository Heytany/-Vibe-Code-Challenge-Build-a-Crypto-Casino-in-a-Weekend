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
  createUpdateMetadataAccountV2Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from '@metaplex-foundation/mpl-token-metadata'
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Auto-load .env so `pnpm devnet:token-meta` targets the CONFIGURED mint, not a hardcoded default.
// (Node does not read .env on its own; without this the script could tag the wrong mint and Phantom
// would still show "Unknown Token" for your real token.)
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const key = m[1]
    const val = m[2].replace(/^["']|["']$/g, '')
    if (process.env[key] === undefined) process.env[key] = val
  }
}
loadDotEnv(path.join(ROOT, '.env'))

const RPC = process.env.NUXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com'
const MINT = process.env.NUXT_PUBLIC_CASINO_TOKEN_MINT ?? process.env.TOKEN_MINT
const METADATA_URI = process.env.WIBE_TOKEN_URI ?? 'https://truebrutal.netlify.app/wibe-token.json'
const KEYPAIR_PATH = (process.env.ANCHOR_WALLET ?? '~/.config/solana/id.json').replace(/^~/, os.homedir())

if (!MINT) {
  console.error('[devnet:token-meta] No mint. Set NUXT_PUBLIC_CASINO_TOKEN_MINT in .env or env.')
  process.exit(1)
}

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

  const data = {
    name: 'Brutal WIBE',
    symbol: 'WIBE',
    uri: METADATA_URI,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  }

  const doUpdate = process.argv.includes('--update') || process.env.UPDATE === '1'

  if (await conn.getAccountInfo(metadataPda)) {
    if (!doUpdate) {
      console.log(`[devnet:token-meta] metadata already exists: ${metadataPda.toBase58()}`)
      console.log('   Name/symbol are on-chain → Phantom shows Brutal WIBE (WIBE) after refresh.')
      console.log('   To (re)set name/symbol/logo URI, run: pnpm devnet:token-meta --update')
      return
    }

    const updateIx = createUpdateMetadataAccountV2Instruction(
      { metadata: metadataPda, updateAuthority: payer.publicKey },
      {
        updateMetadataAccountArgsV2: {
          data,
          updateAuthority: payer.publicKey,
          primarySaleHappened: null,
          isMutable: true,
        },
      },
    )
    const utx = new Transaction().add(updateIx)
    const usig = await conn.sendTransaction(utx, [payer])
    await conn.confirmTransaction(usig, 'confirmed')
    console.log('[devnet:token-meta] ✅ metadata updated (name/symbol/logo URI)')
    console.log(`   metadata: ${metadataPda.toBase58()}`)
    console.log(`   uri: ${METADATA_URI}`)
    console.log(`   tx: ${usig}`)
    console.log('   → reopen Phantom — token should show WIBE with logo')
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
        data,
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
