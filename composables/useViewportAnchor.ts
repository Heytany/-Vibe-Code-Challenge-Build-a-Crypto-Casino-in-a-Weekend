/**
 * @agent-context Pins a fixed overlay element to the VISUAL viewport (the part the user
 * actually sees) so it stays full-screen and centered on iOS, where the address bar / pinch
 * zoom make the visual viewport differ from the layout viewport. Without this the matrix
 * transition and crack modal drift off-centre or fail to cover the screen on mobile Safari.
 * @see shared/motion.ts getVisualViewport, components/motion/*
 */
import type { Ref } from 'vue'
import { getVisualViewport } from '~/shared/motion'

export function useViewportAnchor(target: Ref<HTMLElement | null>, active: Ref<boolean>) {
  function apply() {
    const el = target.value
    if (!el) return
    const vp = getVisualViewport()
    el.style.width = `${vp.width}px`
    el.style.height = `${vp.height}px`
    // translate to the visible region (iOS: address bar offset / zoom)
    el.style.transform = `translate(${vp.offsetLeft}px, ${vp.offsetTop}px)`
  }

  function onChange() {
    if (active.value) apply()
  }

  onMounted(() => {
    const vv = window.visualViewport
    vv?.addEventListener('resize', onChange)
    vv?.addEventListener('scroll', onChange)
    window.addEventListener('resize', onChange)
    window.addEventListener('orientationchange', onChange)
  })

  onUnmounted(() => {
    const vv = window.visualViewport
    vv?.removeEventListener('resize', onChange)
    vv?.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
  })

  watch(active, (a) => {
    if (a) nextTick().then(apply)
  })

  return { apply }
}
