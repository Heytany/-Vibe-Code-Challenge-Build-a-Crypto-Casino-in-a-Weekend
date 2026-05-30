<template>
  <span
    class="bw-skeleton"
    :class="{
      'bw-skeleton--inline': inline,
      'bw-skeleton--block': !inline,
    }"
    :style="sizeStyle"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
/**
 * @agent-context Brutalist loading placeholder — stripe pulse, no spinner chrome.
 */
const props = withDefaults(
  defineProps<{
    inline?: boolean
    width?: string
    height?: string
  }>(),
  { inline: false, width: '100%', height: '1.25rem' },
)

const sizeStyle = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>
