#!/usr/bin/env node
/**
 * Copies Anchor IDL to types/idl/ after anchor build.
 * @agent-context Run via `pnpm copy-idl` after `anchor build`.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'target/idl/wibe_casino.json')
const dest = join(root, 'types/idl/wibe_casino.json')

if (!existsSync(src)) {
  console.warn('[copy-idl] IDL not found at target/idl/wibe_casino.json — run anchor build first')
  process.exit(0)
}

mkdirSync(dirname(dest), { recursive: true })
copyFileSync(src, dest)
console.log('[copy-idl] Copied IDL to types/idl/wibe_casino.json')
