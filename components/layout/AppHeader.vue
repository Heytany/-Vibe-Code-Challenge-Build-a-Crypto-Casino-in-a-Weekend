<template>
  <header class="border-b-4 border-[var(--bw-border)] bg-[var(--bw-bg)] sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3 flex flex-wrap items-center gap-x-3 gap-y-2 max-w-5xl">
      <button
        type="button"
        class="group flex items-center gap-2 bg-transparent border-0 p-0 cursor-pointer text-[var(--bw-fg)]"
        :disabled="motionStore.isLocked"
        @click="goHome"
      >
        <span class="text-lg sm:text-xl font-bold uppercase tracking-widest group-hover:bw-glitch inline-block">
          Brutal wibe
        </span>
        <span class="text-xs text-[var(--bw-muted)] bw-broken-tilt hidden sm:inline">[broken]</span>
      </button>

      <!-- mobile: row 1 = logo + theme + language; wallet drops to row 2 (w-full) -->
      <div class="flex items-center gap-2 ml-auto">
        <LayoutThemeToggle />
        <LayoutLocaleSwitcher />
      </div>
      <WalletConnectButton class="w-full sm:w-auto sm:ml-1" />
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * @agent-context Site header — logo (matrix transition home), locale switcher, wallet connect.
 */
const route = useRoute()
const motionStore = useMotionStore()
const { playRouteTransition } = useBrutalMotion()

function goHome() {
  if (route.path === '/') return
  // same brutal matrix transition as game cards — also animates the return to lobby
  playRouteTransition('/', 'matrix')
}
</script>
