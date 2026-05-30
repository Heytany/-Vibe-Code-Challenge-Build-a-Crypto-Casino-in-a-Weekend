<template>
  <button
    type="button"
    class="bw-btn"
    :class="[broken ? 'bw-broken-tilt' : '', variantClass]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="block w-full">
      <span class="bw-corrupt-bar block mb-2" />
      {{ loadingLabel }}
    </span>
    <span v-else><slot /></span>
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
