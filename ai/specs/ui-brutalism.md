# Brutal wibe — UI brutalism spec

## Brand

- **Name:** Brutal wibe (display), `brutal-wibe` (package)
- **Tone:** broken, hacker-terminal, high motion — but usable

## Tokens (`assets/css/brutalism.css`)

- Background `#0a0a0a`, foreground `#f5f5f0`, accent `#39ff14`
- Font: IBM Plex Mono
- Classes: `.bw-panel`, `.bw-btn`, `.bw-glitch`, `.bw-broken-tilt`

## Rules

1. Touch targets ≥ 44px
2. WCAG AA contrast on text
3. Visible `:focus-visible` rings
4. Intentional misalignment via `.bw-broken-tilt` — not on primary CTA clusters
5. i18n-safe: `whitespace-normal`, no fixed button widths

## Motion

- Win: `.bw-shake` or `.bw-glitch`
- Loading: `.bw-corrupt-bar`

## Meta-narrative

Footer accordion explains broken aesthetic — see `FooterFootnotes.vue`.

## Primitives

Standard UI (toast, alert, accordion) → [`ui-primitives.md`](ui-primitives.md) (Reka wrappers).
