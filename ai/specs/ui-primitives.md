# UI primitives (Reka UI wrappers)

**For Claude/agents:** use wrappers below for standard patterns. Do not hand-roll toasts or modals.

## Setup

- Module: `reka-ui/nuxt` in `nuxt.config.ts`
- Root: `ConfigProvider` + `UiPrimitivesBrutalToastHost` in `app.vue`
- Spec: [`decisions/009-reka-ui-headless.md`](../decisions/009-reka-ui-headless.md)

## Toast (non-blocking feedback)

```ts
const toast = useBrutalToast()

toast.showSuccess('Deposited', '100 tokens in casino balance')
toast.showError(someError) // WibeError or generic Error
toast.fromCode(WibeErrorCode.WalletNotConnected)
```

## Alert dialog (blocking errors / confirm)

```vue
<UiPrimitivesBrutalAlert
  v-model:open="showError"
  :title="t('errors.ENV_INVALID')"
  :description="errorDetail"
/>
```

## Accordion (lists, rules, footnotes)

```vue
<UiPrimitivesBrutalAccordion
  :items="[
    { value: 'rules', title: 'Game rules', content: '...' },
  ]"
/>
```

Reference: `components/layout/FooterFootnotes.vue`

## When to use custom components instead

- Game visuals (dice glitch, slot reels) → `components/games/*`
- Brutalist buttons/panels → `components/ui/BrutalButton.vue`, `BrokenPanel.vue`
- Wallet chrome → `components/wallet/*`

## Raw Reka imports

Allowed only inside `components/ui/primitives/` when adding a **new** wrapper. Pages should not import from `reka-ui` directly.
