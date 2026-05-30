/**
 * @agent-context GSAP client plugin — registers defaults once on app boot.
 * @see ai/specs/ui-motion.md
 */
import gsap from 'gsap'

export default defineNuxtPlugin(() => {
  gsap.defaults({
    ease: 'power4.inOut',
    duration: 0.6,
  })
})
