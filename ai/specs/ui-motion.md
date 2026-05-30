# UI motion (GSAP)

**Rule:** Hero animations only via [`useBrutalMotion`](../../composables/useBrutalMotion.ts). No inline `gsap` in pages.

## Philosophy

90% flat brutalist CSS. 10% **hyper-polished** GSAP scenes — intentional contrast.

## API

| Method | When |
|--------|------|
| `playRouteTransition(to, 'matrix')` | Lobby → game |
| `playRouteTransition(to, 'instant')` | Back to lobby |
| `playCrackModal({ connect })` | Wallet connect |
| `playLocaleSwitch(apply, btn)` | Slug btn glitch + stagger on all `.bw-locale-text` |
| `playThemeSwitch('sun' \| 'moon', apply)` | Day/night — full-screen Lucide flash |
| `playWinBurst(el)` | @todo Cloud — win |
| `playDepositPulse(el)` | @todo Cloud — deposit |
| `playGameEnter(el)` | Game page mount |

## Components

- [`MotionRoot.vue`](../../components/motion/MotionRoot.vue) — mount in app.vue
- [`MatrixTransitionOverlay.vue`](../../components/motion/MatrixTransitionOverlay.vue)
- [`BrutalCrackModal.vue`](../../components/motion/BrutalCrackModal.vue)
- [`SettingsFlashOverlay.vue`](../../components/motion/SettingsFlashOverlay.vue) — theme only
- [`LocaleText.vue`](../../components/ui/LocaleText.vue) — mark i18n copy for locale motion

## Reduced motion

`prefers-reduced-motion: reduce` → instant router.push, no overlays.

## Store

[`stores/motion.ts`](../../stores/motion.ts) — lock, 3s failsafe, overlay state.

## Timelines (route)

1. Matrix canvas rain (0–400ms)
2. Page glitch slices (300–900ms)
3. Green scanline sweep (700–1200ms)
4. router.push + fade

## Timelines (wallet)

1. SVG crack from viewport center
2. Modal scaleY from crack
3. Auto Phantom connect @450ms
4. Success pulse / error glitch
