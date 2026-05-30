<template>
  <button
    type="button"
    class="bw-btn"
    :class="[broken ? 'bw-broken-tilt' : '', variantClass]"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    v-bind="$attrs"
  >
    <span class="bw-btn__stack">
      <span class="bw-btn__face" :class="{ 'bw-btn__face--ghost': loading }">
        <slot />
      </span>
      <span v-if="loading" class="bw-btn__face bw-btn__face--load">
        <span class="bw-corrupt-bar bw-corrupt-bar--btn" aria-hidden="true" />
        <span>{{ loadingLabel }}</span>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * @agent-context Primary brutalist button — min 44px touch target, optional broken tilt.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    loading?: boolean
    loadingLabel?: string
    broken?: boolean
    variant?: 'default' | 'accent'
  }>(),
  {
    disabled: false,
    loading: false,
    loadingLabel: '…',
    broken: true,
    variant: 'default',
  },
)

const variantClass = computed(() =>
  props.variant === 'accent' ? 'border-[var(--bw-accent)]' : '',
)
</script>
