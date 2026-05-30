<template>
  <Teleport to="body">
    <div
      v-show="motionStore.crackOpen"
      class="bw-motion-crack-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-label="t('motion.wallet.title')"
    >
      <MotionScreenCrackOverlay ref="crackRef" />
      <div
        ref="modalRef"
        class="bw-motion-crack-modal bw-panel bw-panel--broken"
      >
        <p class="text-xs text-[var(--bw-muted)] font-mono mb-2">
          {{ t('motion.wallet.subtitle') }}
        </p>
        <h2 class="text-lg font-bold uppercase mb-3 bw-accent">
          {{ titleText }}
        </h2>
        <p class="text-sm whitespace-normal mb-4">
          {{ bodyText }}
        </p>
        <div v-if="motionStore.crackPhase === 'success'" class="bw-corrupt-bar mb-4" />
        <UiBrutalButton
          v-if="showClose"
          :broken="false"
          class="w-full"
          @click="close"
        >
          {{ t('motion.wallet.close') }}
        </UiBrutalButton>
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

const { t } = useI18n()
const motionStore = useMotionStore()
const { showError } = useBrutalToast()

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

watch(
  () => motionStore.crackOpen,
  async (open) => {
    if (!open) return
    await nextTick()
    if (modalRef.value) {
      gsap.set(modalRef.value, { scaleY: 0, opacity: 0, transformOrigin: 'center center' })
      gsap.to(modalRef.value, {
        scaleY: 1,
        opacity: 1,
        duration: MOTION_DURATIONS.crack * 0.6,
        delay: 0.35,
        ease: 'power4.out',
      })
    }
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
    gsap.to(modalRef.value, {
      scaleY: 0,
      opacity: 0,
      duration: 0.25,
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
  background: rgba(0, 0, 0, 0.75);
  padding: 1rem;
}

.bw-motion-crack-modal {
  position: relative;
  z-index: calc(var(--bw-motion-overlay-z, 500) + 2);
  width: min(100%, 22rem);
  padding: 1.5rem;
  transform-origin: center center;
}
</style>
