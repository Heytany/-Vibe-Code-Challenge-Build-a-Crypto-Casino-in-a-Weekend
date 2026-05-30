/**
 * @agent-context Detect prefers-reduced-motion for accessibility fallbacks.
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false)

  function readPreference() {
    if (import.meta.server) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  onMounted(() => {
    prefersReducedMotion.value = readPreference()
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => {
      prefersReducedMotion.value = mq.matches
    }
    mq.addEventListener('change', handler)
    onUnmounted(() => mq.removeEventListener('change', handler))
  })

  return { prefersReducedMotion: readonly(prefersReducedMotion) }
}
