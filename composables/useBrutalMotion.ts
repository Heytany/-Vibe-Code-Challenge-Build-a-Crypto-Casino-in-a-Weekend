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

  /**
   * Win celebration — brutal glitch pop: accent flash + scale punch + jitter shake.
   * Safe to call on every win; returns the timeline so callers can await/chain.
   */
  function playWinBurst(target: HTMLElement | null) {
    const tl = gsap.timeline()
    if (prefersReducedMotion.value || !target) return tl

    tl.set(target, { transformOrigin: 'center center' })
      .to(target, { scale: 1.08, duration: 0.12, ease: 'power3.out' })
      .to(target, {
        keyframes: {
          x: [0, -5, 4, -3, 2, 0],
          rotate: [0, -0.8, 0.6, -0.4, 0],
        },
        duration: 0.32,
        ease: 'steps(5)',
      })
      .fromTo(
        target,
        { boxShadow: '0 0 0 rgba(var(--bw-scanline-rgb), 0.9)' },
        { boxShadow: '0 0 32px rgba(var(--bw-scanline-rgb), 0.9)', duration: 0.18, yoyo: true, repeat: 1 },
        '<',
      )
      .to(target, { scale: 1, duration: 0.16, ease: 'power2.inOut', clearProps: 'transform,boxShadow' })
    return tl
  }

  /** Deposit confirmation — accent shadow swells then settles, signalling tokens landed. */
  function playDepositPulse(target: HTMLElement | null) {
    const tl = gsap.timeline()
    if (prefersReducedMotion.value || !target) return tl

    tl.fromTo(
      target,
      { boxShadow: '0 0 0 rgba(var(--bw-scanline-rgb), 0.0)' },
      { boxShadow: '0 0 26px rgba(var(--bw-scanline-rgb), 0.85)', duration: 0.4, ease: 'power2.out' },
    ).to(target, {
      boxShadow: '0 0 0 rgba(var(--bw-scanline-rgb), 0.0)',
      duration: 0.5,
      ease: 'power2.in',
      clearProps: 'boxShadow',
    })
    return tl
  }

  function playGameEnter(el: HTMLElement | null) {
    if (!el || prefersReducedMotion.value) return
    gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' })
  }

  /** Dice tumble → face front toward player → gentle wobble */
  function playDiceTumble(target: HTMLElement | null): Promise<void> {
    if (!target || prefersReducedMotion.value) {
      if (target) {
        const body = target.querySelector('.bw-dice-cube__body') as HTMLElement | null
        body?.classList.add('bw-dice-cube__body--front')
      }
      return Promise.resolve()
    }
    const body = target.querySelector('.bw-dice-cube__body') as HTMLElement | null
    if (!body) return Promise.resolve()

    const idleX = -18
    const idleY = 28
    body.classList.remove('bw-dice-cube__body--front')

    return new Promise((resolve) => {
      gsap.set(body, { transformPerspective: 640, transformOrigin: '50% 50%' })
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(body, { clearProps: 'transform,transformPerspective' })
            body.classList.add('bw-dice-cube__body--front')
            resolve()
          },
        })
        .fromTo(
          body,
          { rotateX: idleX, rotateY: idleY, rotateZ: 0, scale: 1 },
          {
            rotateX: idleX + 720,
            rotateY: idleY + 630,
            rotateZ: 52,
            scale: 1.04,
            duration: 1.08,
            ease: 'power2.inOut',
          },
        )
        .to(body, {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1.02,
          duration: 0.38,
          ease: 'power3.out',
        })
        .to(body, {
          rotateX: 4,
          rotateY: -3,
          duration: 0.11,
          yoyo: true,
          repeat: 4,
          ease: 'sine.inOut',
        })
    })
  }

  /** Slot spin — timing only; reel flips + antenna twitch are CSS on the mascot */
  function playSlotSpin(_target: HTMLElement | null): Promise<void> {
    if (prefersReducedMotion.value) {
      return Promise.resolve()
    }
    return new Promise((resolve) => {
      gsap.delayedCall(0.85, resolve)
    })
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
    playDiceTumble,
    playSlotSpin,
    playLocaleSwitch,
    playThemeSwitch,
  }
}
