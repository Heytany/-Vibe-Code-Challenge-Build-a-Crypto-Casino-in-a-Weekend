/**
 * @agent-context Single API for hero GSAP animations — do not use gsap directly in pages.
 * @see ai/specs/ui-motion.md, components/motion/MotionRoot.vue
 * @failure-modes: isLocked → ignore duplicate calls; reduced motion → instant paths
 */
import gsap from 'gsap'
import type { CrackModalOptions, RouteTransitionVariant } from '~/shared/motion'
import { shouldSkipHeroMotion } from '~/shared/motion'

export function useBrutalMotion() {
  const router = useRouter()
  const motionStore = useMotionStore()
  const { prefersReducedMotion } = usePrefersReducedMotion()

  async function playRouteTransition(to: string, variant: RouteTransitionVariant = 'matrix') {
    if (motionStore.isLocked) return
    if (shouldSkipHeroMotion(prefersReducedMotion.value, variant)) {
      await router.push(to)
      return
    }
    await motionStore.startMatrix(to)
  }

  async function playCrackModal(options: CrackModalOptions) {
    if (motionStore.isLocked) return
    if (prefersReducedMotion.value) {
      await options.connect()
      return
    }
    await motionStore.startCrack(options.connect)
  }

  /** @todo iteration 3 — slot/dice win burst */
  function playWinBurst(_target: HTMLElement | null) {
    if (prefersReducedMotion.value || !_target) {
      return gsap.timeline()
    }
    return gsap
      .timeline()
      .to(_target, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1 })
  }

  /** @todo iteration 3 — deposit SPL pulse */
  function playDepositPulse(_target: HTMLElement | null) {
    if (prefersReducedMotion.value || !_target) {
      return gsap.timeline()
    }
    return gsap
      .timeline()
      .fromTo(_target, { boxShadow: '0 0 0 var(--bw-accent)' }, { boxShadow: '0 0 24px var(--bw-accent)', duration: 0.4 })
  }

  function playGameEnter(el: HTMLElement | null) {
    if (!el || prefersReducedMotion.value) return
    gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' })
  }

  return {
    prefersReducedMotion,
    playRouteTransition,
    playCrackModal,
    playWinBurst,
    playDepositPulse,
    playGameEnter,
  }
}
