<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="rootRef"
      class="bw-settings-flash bw-settings-flash--theme"
      aria-hidden="true"
    >
      <div ref="backdropRef" class="bw-settings-flash__backdrop" />
      <div ref="wipeRef" class="bw-settings-flash__wipe" />
      <div ref="iconWrapRef" class="bw-settings-flash__icon-wrap">
        <Sun v-if="icon === 'sun'" :size="72" :stroke-width="2.25" />
        <Moon v-else :size="72" :stroke-width="2.25" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * @agent-context Full-screen GSAP flash for day/night theme only.
 * @see composables/useBrutalMotion.ts playThemeSwitch
 */
import gsap from 'gsap'
import { Moon, Sun } from 'lucide-vue-next'
import type { ThemeFlashJob } from '~/shared/settings-motion'
import { THEME_FLASH_DURATION } from '~/shared/settings-motion'

const flashJob = useState<ThemeFlashJob | null>('bw-theme-flash', () => null)

const rootRef = ref<HTMLElement | null>(null)
const backdropRef = ref<HTMLElement | null>(null)
const wipeRef = ref<HTMLElement | null>(null)
const iconWrapRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const icon = ref<'sun' | 'moon'>('sun')
let running = false

async function runFlash(job: ThemeFlashJob) {
  if (running) {
    await job.apply()
    job.resolve()
    return
  }

  running = true
  icon.value = job.icon
  visible.value = true
  await nextTick()

  const tl = gsap.timeline({
    onComplete: () => {
      visible.value = false
      running = false
      job.resolve()
      flashJob.value = null
    },
  })

  if (backdropRef.value) {
    tl.fromTo(backdropRef.value, { opacity: 0 }, { opacity: 0.92, duration: 0.08 }, 0)
  }

  if (wipeRef.value) {
    tl.fromTo(
      wipeRef.value,
      { scaleX: 0, opacity: 0, transformOrigin: 'left center' },
      { scaleX: 1, opacity: 1, duration: THEME_FLASH_DURATION * 0.55, ease: 'power3.inOut' },
      0.04,
    )
    tl.to(
      wipeRef.value,
      { x: '100%', duration: THEME_FLASH_DURATION * 0.45, ease: 'power2.in' },
      THEME_FLASH_DURATION * 0.35,
    )
  }

  if (iconWrapRef.value) {
    tl.fromTo(
      iconWrapRef.value,
      { opacity: 0, scale: 0.5, rotate: -20 },
      { opacity: 1, scale: 1, rotate: 0, duration: 0.28, ease: 'power4.out' },
      0.1,
    )
    tl.to(iconWrapRef.value, {
      rotate: 8,
      duration: 0.06,
      repeat: 3,
      yoyo: true,
      ease: 'steps(1)',
    }, 0.14)
    tl.to(iconWrapRef.value, { opacity: 0, scale: 0.85, duration: 0.18 }, THEME_FLASH_DURATION * 0.72)
  }

  tl.call(() => {
    void Promise.resolve(job.apply())
  }, undefined, THEME_FLASH_DURATION * 0.42)

  if (backdropRef.value) {
    tl.to(backdropRef.value, { opacity: 0, duration: 0.2 }, THEME_FLASH_DURATION * 0.65)
  }
}

watch(flashJob, (job) => {
  if (job) runFlash(job)
})
</script>
