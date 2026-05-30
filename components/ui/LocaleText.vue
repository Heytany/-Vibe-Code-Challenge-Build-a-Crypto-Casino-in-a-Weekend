<template>
  <component :is="tag" class="bw-locale-text" v-bind="$attrs">
    <slot>{{ translated }}</slot>
  </component>
</template>

<script setup lang="ts">
/**
 * @agent-context i18n copy marked for locale-switch GSAP — use instead of raw t() in UI.
 * @see composables/useBrutalMotion.ts playLocaleSwitch
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    path?: string
    tag?: string
  }>(),
  { tag: 'span' },
)

const { t } = useI18n()
const translated = computed(() => (props.path ? t(props.path) : ''))
</script>

<style scoped>
.bw-locale-text {
  display: inline-block;
  will-change: transform, opacity;
}
</style>
