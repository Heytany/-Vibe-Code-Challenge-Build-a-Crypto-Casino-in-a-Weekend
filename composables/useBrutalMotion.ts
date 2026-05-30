/**
 * @agent-context Single API for hero GSAP animations — do not use gsap directly in pages.
 * @see ai/specs/ui-motion.md, components/motion/MotionRoot.vue
 * @failure-modes: isLocked → ignore duplicate calls; reduced motion → instant paths
 */
import gsap from 'gsap'
import type { CrackModalOptions, RouteTransitionVariant } from '~/shared/motion'
import { shouldSkipHeroMotion } from '~/shared/motion'
import type { ThemeFlashIcon, ThemeFlashJob } from '~/shared/settings-motion'
import { LOCALE_SWITCH_DURATION } from '~/shared/settings-motion'
import { queryLocaleTextElements } from '~/shared/locale-text-motion'

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
    try {
      await Promise.race([
        motionStore.startMatrix(to),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('matrix transition timeout')), 4000),
        ),
      ])
    } catch {
      await router.push(to)
      motionStore.unlockMotion()
    }
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

  const themeFlashJob = useState<ThemeFlashJob | null>('bw-theme-flash', () => null)

  /** Button glitch + stagger on all `.bw-locale-text` copy (slugs + page strings) */
  async function playLocaleSwitch(
    apply: () => void | Promise<void>,
    button: HTMLElement | null,
  ) {
    if (motionStore.isLocked || prefersReducedMotion.value) {
      await apply()
      return
    }

    const textEls = import.meta.client ? queryLocaleTextElements() : []

    if (button) {
      gsap.to(button, {
        scale: 0.86,
        rotate: -4,
        duration: 0.07,
        ease: 'power2.in',
        transformOrigin: 'center center',
      })
    }

    if (textEls.length) {
      await gsap.to(textEls, {
        opacity: 0,
        y: -6,
        skewX: () => (Math.random() - 0.5) * 10,
        duration: 0.1,
        stagger: 0.01,
        ease: 'power2.in',
      })
    } else {
      await gsap.to({}, { duration: LOCALE_SWITCH_DURATION * 0.35 })
    }

    await apply()
    await nextTick()

    const refreshed = import.meta.client ? queryLocaleTextElements() : []

    if (refreshed.length) {
      gsap.set(refreshed, { opacity: 0, y: 6 })
      await gsap.to(refreshed, {
        opacity: 1,
        y: 0,
        skewX: 0,
        duration: 0.16,
        stagger: 0.014,
        ease: 'power3.out',
        clearProps: 'transform',
      })
    }

    if (button) {
      gsap.to(button, {
        scale: 1,
        rotate: 0,
        duration: 0.16,
        ease: 'power3.out',
        clearProps: 'boxShadow,transform',
      })
    }
  }

  async function playThemeSwitch(
    icon: ThemeFlashIcon,
    apply: () => void | Promise<void>,
  ) {
    if (motionStore.isLocked || prefersReducedMotion.value) {
      await apply()
      return
    }
    await new Promise<void>((resolve) => {
      themeFlashJob.value = { icon, apply, resolve }
    })
  }

  return {
    prefersReducedMotion,
    playRouteTransition,
    playCrackModal,
    playWinBurst,
    playDepositPulse,
    playGameEnter,
    playLocaleSwitch,
    playThemeSwitch,
  }
}
