<template>
  <MatrixTransitionOverlay />
  <BrutalCrackModal />
  <SettingsFlashOverlay />
</template>

<script setup lang="ts">
/**
 * @agent-context Mount all motion overlays once — wired in app.vue.
 * @see ai/specs/ui-motion.md
 */
import MatrixTransitionOverlay from '~/components/motion/MatrixTransitionOverlay.vue'
import BrutalCrackModal from '~/components/motion/BrutalCrackModal.vue'
import SettingsFlashOverlay from '~/components/motion/SettingsFlashOverlay.vue'
</script>
