<template>
  <header class="border-b-4 border-[var(--bw-border)] bg-[var(--bw-bg)] sticky top-0 z-50">
    <div class="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4 max-w-5xl">
      <NuxtLink to="/" class="group flex items-center gap-2 no-underline text-[var(--bw-fg)]">
        <span class="text-xl font-bold uppercase tracking-widest group-hover:bw-glitch inline-block">
          Brutal wibe
        </span>
        <span class="text-xs text-[var(--bw-muted)] bw-broken-tilt hidden sm:inline">[broken]</span>
      </NuxtLink>

      <div class="flex flex-wrap items-center gap-3">
        <LayoutThemeToggle />
        <LayoutLocaleSwitcher />
        <WalletConnectButton />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * @agent-context Site header — logo, locale switcher, wallet connect.
 */
</script>
