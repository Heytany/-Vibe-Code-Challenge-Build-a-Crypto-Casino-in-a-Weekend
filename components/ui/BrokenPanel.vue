<template>
  <div
    class="bw-panel bw-panel--broken p-6"
    :class="tiltClass"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Broken panel container — intentional misalignment, still readable.
 */
const props = withDefaults(
  defineProps<{
    tilt?: 'none' | 'left' | 'right'
  }>(),
  { tilt: 'left' },
)

const tiltClass = computed(() => {
  const map = {
    none: '',
    left: 'bw-broken-tilt',
    right: 'bw-broken-tilt-alt',
  }
  return map[props.tilt]
})
</script>
