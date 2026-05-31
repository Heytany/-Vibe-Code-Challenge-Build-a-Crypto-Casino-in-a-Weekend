/**
 * @agent-context Browser polyfill — @solana/spl-token and Anchor expect Node `Buffer`.
 * Module-level assignment runs before plugin setup; filename prefix keeps this early in the graph.
 */
import { Buffer } from 'buffer'

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer
}

export default defineNuxtPlugin({
  name: 'bw-buffer-polyfill',
  enforce: 'pre',
  setup() {},
})
