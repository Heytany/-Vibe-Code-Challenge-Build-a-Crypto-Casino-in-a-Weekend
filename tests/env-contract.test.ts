/**
 * @agent-context Validates .env.example documents every required public env key.
 * @run pnpm test:env
 * @failure-modes: Missing key in .env.example → test fails with key name
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ENV_EXAMPLE_KEYS, parsePublicEnv } from './helpers/env-contract'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function parseEnvExample(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    result[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return result
}

describe('env contract', () => {
  it('.env.example contains all required keys', () => {
    const content = readFileSync(join(root, '.env.example'), 'utf-8')
    const parsed = parseEnvExample(content)

    for (const key of ENV_EXAMPLE_KEYS) {
      expect(parsed, `Missing ${key} in .env.example`).toHaveProperty(key)
      expect(parsed[key]?.length, `${key} should have a value in .env.example`).toBeGreaterThan(0)
    }
  })

  it('placeholder values pass zod schema (skeleton dev)', () => {
    const content = readFileSync(join(root, '.env.example'), 'utf-8')
    const parsed = parseEnvExample(content)

    const publicOnly = {
      NUXT_PUBLIC_SOLANA_NETWORK: parsed.NUXT_PUBLIC_SOLANA_NETWORK,
      NUXT_PUBLIC_SOLANA_RPC_URL: parsed.NUXT_PUBLIC_SOLANA_RPC_URL,
      NUXT_PUBLIC_CASINO_PROGRAM_ID: parsed.NUXT_PUBLIC_CASINO_PROGRAM_ID,
      NUXT_PUBLIC_CASINO_TOKEN_MINT: parsed.NUXT_PUBLIC_CASINO_TOKEN_MINT,
    }

    expect(() => parsePublicEnv(publicOnly)).not.toThrow()
  })
})
