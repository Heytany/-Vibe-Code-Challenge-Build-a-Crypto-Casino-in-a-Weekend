# Итерация 8

## Мобайл-моушн, честная игра, автороллы/фуллскрин и сплит-анимация слота

> Оператор: Claude (Cowork). Все правки — фронт; сборку/тесты гонять у PO на хосте.

## Что просил PO

1. Доработать анимацию перехода при скролле на мобиле (особенно iOS): отлипает хедер, «кодовый переход» не на весь экран.
2. Анимации кодового перехода и crack-модалки центрировать по **текущему экрану**, а не по всему приложению.
3. Настройки игр: модуль автоматизации роллов (автороллы, ставка/ролл, ускорение ×2), режим во весь экран с видимыми тостами за победу.
4. Слот: при выигрыше делить панель на N частей (2 линии → норм+инверт, 3 линии → норм+инверт+норм) с кодовой анимацией.
5. Таб «честная игра» (README: verifiable on-chain) — модуль сидирования, чтобы видно было, что не скам.

## Сделано

### 1–2. iOS / визуальный вьюпорт (ADR-018)

- `shared/motion.ts` → `getVisualViewport()`, `composables/useViewportAnchor.ts` — overlay'и (matrix + crack) теперь привязаны к **видимому** экрану и трекают изменения адресной строки/зума.
- Канвас и центр трещин — по визуальному вьюпорту; глитч-полосы matrix на весь экран.
- CSS: `100dvh`, `overscroll-behavior: none` (гасит iOS rubber-band → хедер не отлипает), `touch-action: none` при блокировке моушна.

### 5. Честная игра (ADR-015)

- `components/games/ProvablyFair.vue` — вкладка **Fair** в обеих играх. Показывает blockhash/seed/nonce/domain + результат и **пересчитывает локально** через `shared/rng-verify.ts` (та же FNV-1a, что on-chain). MATCH/MISMATCH. Live → ссылка в Solana Explorer.

### 3. Автороллы / ×2 / фуллскрин (ADR-016)

- `useAutoPlay` (N раундов / ∞, stop-on-win), `useFullscreen` (фуллскрин документа → тосты видны; скрытие хедера/футера), `useBrutalMotion().setMotionSpeed` (gsap timeScale ×2).
- `components/games/GameAutoFsBar.vue` — общий бар в play-вкладке Dice и Slot. Игры отдают `playOnce(): Promise<boolean>`.

### 4. Сплит-анимация слота (ADR-017)

- `MatrixPanelBackdrop.playSplit(segments)` — на выигрыше слота делит фон на N полос: чётные полосы — инвертированный код-свип в обратную сторону. Пара (×2) → 2, тройка (×10) → 3.

## Файлы

| Новые | Изменённые |
|------|-----------|
| `composables/useViewportAnchor.ts`, `useAutoPlay.ts`, `useFullscreen.ts` | `shared/motion.ts`, `assets/css/brutalism.css` |
| `components/games/ProvablyFair.vue`, `GameAutoFsBar.vue` | `MatrixTransitionOverlay.vue`, `ScreenCrackOverlay.vue`, `BrutalCrackModal.vue`, `MatrixPanelBackdrop.vue` |
| ADR-015…018 | `DiceGame.vue`, `SlotGame.vue`, `useBrutalMotion.ts`, `i18n/{en,ru,uk}.json` |

## Проверки

| Что | Результат |
|-----|-----------|
| Provably Fair + Auto-bar (вёрстка/контраст, 430px) | ✅ скриншот-прототип |
| Desktop-регресс overlay'ев | ✅ нет (visualViewport == innerW/H, offset 0) |
| iOS на устройстве | ⏳ проверить у PO (песочница не эмулирует Safari) |
| `pnpm build` / `pnpm test:e2e` | ⏳ у PO на хосте (нативные модули собраны под macOS) |

| | |
|---|---|
| **Оператор** | Claude (Cowork) |
| **Расход** | см. Settings → Usage (Cowork точный токен-каунт не даёт) |
