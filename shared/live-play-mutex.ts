/**
 * @agent-context Serialize LIVE play/sign RPCs — Phantom handles one signing flow at a time.
 * Auto-roll must not start the next round while the previous signTransaction is still settling.
 */

let chain: Promise<unknown> = Promise.resolve()

export function enqueueLivePlay<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(() => fn(), () => fn())
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

/** Clear stuck full-page interaction locks after cancel / auto-roll stop. */
export function resetStaleUiLocks() {
  if (!import.meta.client) return
  document.body.classList.remove('bw-motion-lock', 'bw-alert-open')
  try {
    useMotionStore().unlockMotion()
  } catch {
    /* pinia not ready during teardown */
  }
}
