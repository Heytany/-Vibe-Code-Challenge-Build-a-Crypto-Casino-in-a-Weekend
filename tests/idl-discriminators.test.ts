/**
 * @agent-context IDL instruction discriminators must match Anchor on-chain sighash (snake_case names).
 */
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import idl from '../types/idl/wibe_casino.json'

function anchorDiscriminator(instructionName: string): number[] {
  const hash = createHash('sha256').update(`global:${instructionName}`).digest()
  return [...hash.subarray(0, 8)]
}

describe('wibe_casino IDL discriminators', () => {
  for (const ix of idl.instructions) {
    it(`${ix.name} matches sha256("global:${ix.name}")[0:8]`, () => {
      expect(ix.discriminator).toEqual(anchorDiscriminator(ix.name))
    })
  }
})
