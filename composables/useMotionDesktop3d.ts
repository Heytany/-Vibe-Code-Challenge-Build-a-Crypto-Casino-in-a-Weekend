/**
 * @agent-context Desktop-only 3D motion — skip on touch / reduced motion.
 */
export function useMotionDesktop3d() {
  const canUse3d = ref(false)

  function readCapability() {
    if (import.meta.server) return false
    return window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  onMounted(() => {
    canUse3d.value = readCapability()
    const mq = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)')
    const handler = () => {
      canUse3d.value = readCapability()
    }
    mq.addEventListener('change', handler)
    onUnmounted(() => mq.removeEventListener('change', handler))
  })

  return { canUse3d: readonly(canUse3d) }
}
