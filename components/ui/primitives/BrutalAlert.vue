<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="bw-alert-portal"
      role="alertdialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="descId"
    >
      <div class="bw-alert-scrim" aria-hidden="true" @click="onCancel" />
      <div ref="stageRef" class="bw-alert-stage">
        <div class="bw-alert-content bw-panel bw-panel--broken p-6">
          <h2 :id="titleId" class="text-lg font-bold uppercase mb-2 bw-accent">
            {{ title }}
          </h2>
          <p :id="descId" class="text-sm whitespace-normal mb-6 text-[var(--bw-muted)]">
            {{ description }}
          </p>
          <div class="flex flex-wrap gap-3 justify-end">
            <UiBrutalButton :broken="false" @click="onCancel">
              {{ cancelLabel }}
            </UiBrutalButton>
            <UiBrutalButton v-if="actionLabel" variant="accent" @click="onAction">
              {{ actionLabel }}
            </UiBrutalButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * @agent-context Viewport-fixed confirm dialog — Teleport to body + visual viewport anchor (iOS).
 * Do not use Reka AlertDialogPortal here; nested transforms (header tilt) break fixed centering.
 * @see components/motion/BrutalCrackModal.vue
 */
withDefaults(
  defineProps<{
    title: string
    description: string
    cancelLabel?: string
    actionLabel?: string
  }>(),
  {
    cancelLabel: 'OK',
    actionLabel: undefined,
  },
)

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ action: [], cancel: [] }>()

const titleId = useId()
const descId = useId()
const stageRef = ref<HTMLElement | null>(null)

useViewportAnchor(stageRef, open)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) onCancel()
}

watch(open, (isOpen) => {
  if (!import.meta.client) return
  if (isOpen) {
    document.body.classList.add('bw-alert-open')
    window.addEventListener('keydown', onKeydown)
  } else {
    document.body.classList.remove('bw-alert-open')
    window.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.classList.remove('bw-alert-open')
    window.removeEventListener('keydown', onKeydown)
  }
})

function onCancel() {
  emit('cancel')
  open.value = false
}

function onAction() {
  emit('action')
  open.value = false
}
</script>
