# Итерация 18 — WIBE Wheel (фасет-колесо)

> Оператор: Claude (Cowork). Строго **аддитивно**: dice/slot/deposit/withdraw и их аккаунты не тронуты.

## Зачем
Тестеру больше не нужно вручную выпрашивать WIBE — колесо в лобби бесплатно начисляет WIBE на **casino-баланс** (играй сразу).

## Что добавлено (только новое)
**On-chain (`programs/wibe-casino/src/lib.rs`):**
- сиды `FAUCET_CONFIG_SEED`/`FAUCET_CLAIM_SEED`, `FAUCET_COOLDOWN_SECS=86400`;
- инструкции `init_faucet(initial_remaining)` (authority-only) и `spin_wheel(user_seed)`;
- аккаунты `FaucetConfig{authority,remaining,bump}`, `FaucetClaim{last_claim,spins,bump}` (PDA per wallet);
- `wheel_prize()` — скошенное 1..1000 (1000 ≈ 0.1%); событие `WheelSpun`; ошибки `FaucetEmpty`/`FaucetCooldown`.
- Кулдаун 24ч через `Clock`; начисляет `UserBalance.amount`; списывает из `faucet.remaining`.

**IDL:** `types/idl/wibe_casino.json` пропатчен скриптом (дискриминаторы sha256) — `anchor build` не нужен.

**Фронт (новые файлы):** `composables/useWheel.ts`, `components/games/WheelGame.vue`, `pages/games/wheel.vue`, `components/lobby/WheelBanner.vue`, хелперы PDA в `shared/casino-pdas.ts`, ключи `games.wheel.*` (EN/RU/UK). Баннер вставлен в `pages/index.vue` после блока игр.

**Правила колеса:** LIVE + кошелёк обязательны, без автороллов, не provably-fair (это раздача), фонд показан в баннере, при опустошении → кнопка дизейбл + `FaucetEmpty`.

## Host-runbook (devnet)
```bash
# 1. собрать .so (IDL шаг ломается — это ок) и задеплоить апгрейд
anchor build --no-idl || true
solana program deploy target/deploy/wibe_casino.so \
  --program-id target/deploy/wibe_casino-keypair.json \
  --url devnet --upgrade-authority ~/.config/solana/id.json --use-rpc --max-sign-attempts 1000
# 2. залить фонд в vault (адрес печатает скрипт) и инициализировать пул
pnpm devnet:faucet            # печатает vault → spl-token transfer <MINT> 3333 <VAULT> --url devnet --fund-recipient
pnpm devnet:faucet            # повторно: initFaucet(3333)
```
> IDL уже содержит новые ix (ручной патч) → `copy-idl` не нужен; фронт-деплой как обычно `git push`.

## Проверки
- IDL валиден, дискриминаторы sha256; синтаксис скриптов/JSON ok.
- Сборку Rust + деплой + спин — на хосте (песочница не умеет Solana toolchain).

| | |
|---|---|
| Оператор | Claude (Cowork) |
