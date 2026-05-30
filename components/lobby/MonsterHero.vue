<template>
  <div
    class="bw-monster-stage"
    :class="{ 'is-rolling': rolling, 'bw-monster-stage--dice': variant === 'dice' }"
  >
    <!-- Decorative pixel-art monster. CSS-driven idle motion (flat layer). -->
    <div class="bw-monster-figure" aria-hidden="true">
      <svg
        viewBox="0 0 320 150"
        shape-rendering="crispEdges"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <g class="bw-mon-figure">
          <!-- writhing tentacles (behind body); reach toward the panel-area edges -->
          <g class="bw-mon-tentacle bw-mon-tentacle--la" fill="var(--bw-fg)">
            <rect x="117" y="29" width="14" height="9" />
            <rect x="104" y="36" width="14" height="9" />
            <rect x="91" y="38" width="14" height="8" />
            <rect x="78" y="32" width="14" height="8" />
            <rect x="65" y="23" width="14" height="8" />
            <rect x="52" y="21" width="14" height="7" />
            <rect x="39" y="25" width="14" height="7" />
            <rect x="26" y="33" width="14" height="6" />
            <rect x="13" y="39" width="14" height="6" />
            <rect x="0" y="37" width="11" height="5" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--ra" fill="var(--bw-fg)">
            <rect x="189" y="29" width="14" height="9" />
            <rect x="202" y="36" width="14" height="9" />
            <rect x="215" y="38" width="14" height="8" />
            <rect x="228" y="32" width="14" height="8" />
            <rect x="241" y="23" width="14" height="8" />
            <rect x="254" y="21" width="14" height="7" />
            <rect x="267" y="25" width="14" height="7" />
            <rect x="280" y="33" width="14" height="6" />
            <rect x="293" y="39" width="14" height="6" />
            <rect x="309" y="37" width="11" height="5" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--lb" fill="var(--bw-fg)">
            <rect x="115" y="48" width="15" height="13" />
            <rect x="103" y="55" width="15" height="12" />
            <rect x="91" y="49" width="15" height="11" />
            <rect x="79" y="38" width="15" height="9" />
            <rect x="67" y="35" width="15" height="8" />
            <rect x="55" y="45" width="12" height="7" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--rb" fill="var(--bw-fg)">
            <rect x="190" y="48" width="15" height="13" />
            <rect x="202" y="55" width="15" height="12" />
            <rect x="214" y="49" width="15" height="11" />
            <rect x="226" y="38" width="15" height="9" />
            <rect x="238" y="35" width="15" height="8" />
            <rect x="253" y="45" width="12" height="7" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--lc" fill="var(--bw-fg)">
            <rect x="117" y="69" width="13" height="8" />
            <rect x="104" y="60" width="13" height="8" />
            <rect x="91" y="52" width="13" height="7" />
            <rect x="78" y="51" width="13" height="7" />
            <rect x="65" y="59" width="13" height="6" />
            <rect x="52" y="68" width="13" height="6" />
            <rect x="39" y="71" width="13" height="5" />
            <rect x="26" y="65" width="13" height="5" />
            <rect x="13" y="55" width="10" height="5" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--rc" fill="var(--bw-fg)">
            <rect x="190" y="69" width="13" height="8" />
            <rect x="203" y="60" width="13" height="8" />
            <rect x="216" y="52" width="13" height="7" />
            <rect x="229" y="51" width="13" height="7" />
            <rect x="242" y="59" width="13" height="6" />
            <rect x="255" y="68" width="13" height="6" />
            <rect x="268" y="71" width="13" height="5" />
            <rect x="281" y="65" width="13" height="5" />
            <rect x="297" y="55" width="10" height="5" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--ld" fill="var(--bw-fg)">
            <rect x="113" y="46" width="12" height="7" />
            <rect x="102" y="44" width="12" height="6" />
            <rect x="91" y="36" width="12" height="5" />
            <rect x="80" y="34" width="9" height="5" fill="var(--bw-accent)" />
          </g>
          <g class="bw-mon-tentacle bw-mon-tentacle--rd" fill="var(--bw-fg)">
            <rect x="195" y="46" width="12" height="7" />
            <rect x="206" y="44" width="12" height="6" />
            <rect x="217" y="36" width="12" height="5" />
            <rect x="231" y="34" width="9" height="5" fill="var(--bw-accent)" />
          </g>

          <!-- arms drawn first (behind body) reaching down to grip each panel -->
          <g class="bw-mon-arm bw-mon-arm--l" fill="var(--bw-fg)">
            <rect x="104" y="72" width="20" height="18" />
            <rect x="86" y="86" width="22" height="18" />
            <rect x="70" y="100" width="22" height="20" />
            <rect x="58" y="116" width="44" height="22" />
            <rect x="58" y="138" width="10" height="8" />
            <rect x="76" y="138" width="10" height="8" />
            <rect x="92" y="138" width="10" height="8" />
          </g>
          <g class="bw-mon-arm bw-mon-arm--r" fill="var(--bw-fg)">
            <rect x="196" y="72" width="20" height="18" />
            <rect x="212" y="86" width="22" height="18" />
            <rect x="228" y="100" width="22" height="20" />
            <rect x="218" y="116" width="44" height="22" />
            <rect x="218" y="138" width="10" height="8" />
            <rect x="236" y="138" width="10" height="8" />
            <rect x="254" y="138" width="10" height="8" />
          </g>

          <!-- antenna tips (accent flicker) -->
          <g class="bw-mon-antenna" fill="var(--bw-accent)">
            <rect x="128" y="2" width="8" height="8" />
            <rect x="184" y="2" width="8" height="8" />
          </g>
          <rect x="129" y="8" width="6" height="10" fill="var(--bw-fg)" />
          <rect x="185" y="8" width="6" height="10" fill="var(--bw-fg)" />

          <!-- horns -->
          <rect x="120" y="14" width="16" height="12" fill="var(--bw-fg)" />
          <rect x="184" y="14" width="16" height="12" fill="var(--bw-fg)" />

          <!-- body -->
          <rect x="116" y="22" width="88" height="78" fill="var(--bw-fg)" />
          <!-- brow -->
          <rect x="126" y="32" width="68" height="6" fill="var(--bw-bg)" />
          <!-- eye socket -->
          <rect x="130" y="40" width="60" height="26" fill="var(--bw-bg)" />
          <!-- glowing cyclops pupil (blinks) -->
          <rect class="bw-mon-pupil" x="146" y="46" width="28" height="14" fill="var(--bw-accent)" />
          <!-- jagged mouth -->
          <rect x="128" y="74" width="64" height="14" fill="var(--bw-bg)" />
          <rect x="134" y="74" width="6" height="8" fill="var(--bw-fg)" />
          <rect x="150" y="74" width="6" height="8" fill="var(--bw-fg)" />
          <rect x="166" y="74" width="6" height="8" fill="var(--bw-fg)" />
          <rect x="182" y="74" width="6" height="8" fill="var(--bw-fg)" />
          <!-- belly accent bar -->
          <rect x="126" y="92" width="68" height="4" fill="var(--bw-accent)" />

          <!-- corruption slice (occasional glitch) -->
          <rect class="bw-mon-slice" x="116" y="50" width="88" height="6" fill="var(--bw-accent)" />
        </g>
      </svg>
    </div>

    <!-- panels the monster holds in its paws (lobby: 2 cols, dice: 1 center cube) -->
    <div class="bw-monster-hands" :class="`bw-monster-hands--${variant}`">
      <template v-if="variant === 'lobby'">
        <div class="bw-paw-mount bw-paw-mount--left">
          <slot name="left" />
        </div>
        <div class="bw-paw-mount bw-paw-mount--right">
          <slot name="right" />
        </div>
      </template>
      <div v-else class="bw-paw-mount bw-paw-mount--center">
        <slot name="center" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @agent-context Lobby hero — decorative pixel-art monster that "holds" game panels in
 * its paws. `variant="lobby"` → #left/#right; `variant="dice"` → #center (one rolling die).
 * Idle motion is CSS-only — GSAP stays reserved for route/wallet/win/dice tumble.
 * @see ai/specs/ui-motion.md, ai/decisions/013-lobby-monster-hero.md
 */
withDefaults(
  defineProps<{
    variant?: 'lobby' | 'dice'
    /** Faster paw/arm motion while the die is tumbling */
    rolling?: boolean
  }>(),
  { variant: 'lobby', rolling: false },
)
</script>
