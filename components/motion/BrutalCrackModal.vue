<template>
  <Teleport to="body">
    <div
      v-show="motionStore.crackOpen"
      ref="backdropRef"
      class="bw-motion-crack-backdrop"
      :class="{ 'bw-motion-crack-backdrop--3d': canUse3d }"
      role="dialog"
      aria-modal="true"
      :aria-label="t('motion.wallet.title')"
    >
      <ScreenCrackOverlay ref="crackRef" />
      <div ref="modalWrapRef" class="bw-motion-crack-modal-wrap">
        <div
          ref="modalRef"
          class="bw-motion-crack-modal bw-panel bw-panel--broken"
        >
          <p class="text-xs text-[var(--bw-muted)] font-mono mb-2">
            <UiLocaleText path="motion.wallet.subtitle" tag="span" />
          </p>
          <h2 class="text-lg font-bold uppercase mb-3 bw-accent bw-locale-text">
            {{ titleText }}
          </h2>
          <p class="text-sm whitespace-normal mb-4 bw-locale-text">
            {{ bodyText }}
          </p>
          <div v-if="motionStore.crackPhase === 'success'" class="bw-corrupt-bar mb-4" />
          <UiBrutalButton
            v-if="showClose"
            :broken="false"
            class="w-full"
            @click="close"
          >
            <UiLocaleText path="motion.wallet.close" tag="span" />
          </UiBrutalButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * @agent-context Wallet connect modal — emerges from screen crack at viewport center.
 * @see composables/useBrutalMotion.ts playCrackModal
 */
import gsap from 'gsap'
import { MOTION_DURATIONS } from '~/shared/motion'
import ScreenCrackOverlay from '~/components/motion/ScreenCrackOverlay.vue'

const { t } = useI18n()
const motionStore = useMotionStore()
const { showError } = useBrutalToast()
const { canUse3d } = useMotionDesktop3d()

const backdropRef = ref<HTMLElement | null>(null)
const modalWrapRef = ref<HTMLElement | null>(null)
const modalRef = ref<HTMLElement | null>(null)
const crackRef = ref<{ animateCrack: () => Promise<unknown>; hideCrack: () => void } | null>(null)

const titleText = computed(() => {
  switch (motionStore.crackPhase) {
    case 'opening':
    case 'connecting':
      return t('motion.wallet.linking')
    case 'success':
      return t('motion.wallet.linked')
    case 'error':
      return t('motion.wallet.failed')
    default:
      return t('motion.wallet.title')
  }
})

const bodyText = computed(() => {
  if (motionStore.crackMessage) return motionStore.crackMessage
  switch (motionStore.crackPhase) {
    case 'opening':
      return t('motion.wallet.opening')
    case 'connecting':
      return t('motion.wallet.connecting')
    case 'success':
      return t('motion.wallet.success')
    case 'error':
      return t('motion.wallet.error')
    default:
      return ''
  }
})

const showClose = computed(() =>
  ['success', 'error'].includes(motionStore.crackPhase),
)

function animateModalOpen() {
  if (!modalRef.value) return

  if (canUse3d.value) {
    gsap.set(modalRef.value, {
      transformPerspective: 1100,
      transformOrigin: '50% 40%',
    })
    gsap.fromTo(
      modalRef.value,
      { rotateX: 72, scale: 0.78, opacity: 0, y: 48, z: -180 },
      {
        rotateX: 0,
        scale: 1,
        opacity: 1,
        y: 0,
        z: 40,
        duration: MOTION_DURATIONS.crack * 0.75,
        delay: 0.42,
        ease: 'power4.out',
      },
    )
    return
  }

  gsap.set(modalRef.value, { scaleY: 0, opacity: 0, transformOrigin: 'center center' })
  gsap.to(modalRef.value, {
    scaleY: 1,
    opacity: 1,
    duration: MOTION_DURATIONS.crack * 0.6,
    delay: 0.38,
    ease: 'power4.out',
  })
}

watch(
  () => motionStore.crackOpen,
  async (open) => {
    if (!open) return
    await nextTick()
    animateModalOpen()
  },
)

watch(
  () => motionStore.crackPhase,
  async (phase) => {
    if (phase === 'success') {
      if (modalRef.value) {
        gsap.to(modalRef.value, {
          boxShadow: '0 0 32px rgba(57, 255, 20, 0.5)',
          duration: 0.3,
          yoyo: true,
          repeat: 1,
        })
      }
      setTimeout(() => close(), 1200)
    }
    if (phase === 'error') {
      if (modalRef.value) {
        gsap.to(modalRef.value, { x: '+=6', duration: 0.05, repeat: 5, yoyo: true, clearProps: 'x' })
      }
      showError(new Error(t('motion.wallet.error')))
      setTimeout(() => close(), 800)
    }
  },
)

function close() {
  if (modalRef.value) {
    const props = canUse3d.value
      ? { rotateX: 55, scale: 0.85, opacity: 0, y: 24, z: -120 }
      : { scaleY: 0, opacity: 0 }

    gsap.to(modalRef.value, {
      ...props,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: () => {
        crackRef.value?.hideCrack()
        motionStore.finishCrack()
      },
    })
  } else {
    motionStore.finishCrack()
  }
}
</script>

<style scoped>
.bw-motion-crack-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--bw-motion-overlay-z, 500);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  padding: 1rem;
  isolation: isolate;
}

.bw-motion-crack-backdrop--3d {
  perspective: 1100px;
  perspective-origin: 50% 42%;
}

.bw-motion-crack-modal-wrap {
  position: relative;
  z-index: 2;
  transform-style: preserve-3d;
}

.bw-motion-crack-modal {
  position: relative;
  width: min(100%, 22rem);
  padding: 1.5rem;
  transform-origin: 50% 40%;
  will-change: transform, opacity;
  box-shadow:
    6px 6px 0 var(--bw-accent),
    0 24px 48px rgba(0, 0, 0, 0.55);
}

.bw-motion-crack-backdrop--3d .bw-motion-crack-modal {
  backface-visibility: hidden;
}
</style>
