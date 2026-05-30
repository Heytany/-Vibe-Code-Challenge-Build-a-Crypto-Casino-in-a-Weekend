# Итерация 4 — ПЛАН для Cursor: игра Dice «Glitch Roll» от и до

> Это **план передачи в Cursor**, не выполненная итерация. Claude (Cowork) не может
> деплоить в devnet / подписывать Phantom / собирать проект из своей среды, поэтому здесь —
> точные шаги до рабочей игры. Всё вспомогательное уже заложено в ит.3 (см. ниже).

## Что уже готово (ит.3, можно опираться)

- `programs/wibe-casino/src/lib.rs` — `initialize / deposit / withdraw / play_dice / play_slot`, FNV-1a RNG, события `DicePlayed/SlotPlayed`. **Менять не нужно.**
- `shared/rng-verify.ts` — TS-зеркало RNG + `verifyDice` + `base58Decode` (+ тест `tests/rng-verify.test.ts`).
- `useBrutalMotion().playWinBurst / playDepositPulse` — анимации готовы.
- i18n: `games.common.*`, `games.dice.*`, `seo.dice.*` (EN/RU/UK).
- Заглушки: `useCasinoProgram.ts`, `useGameDice.ts`, `components/games/DiceGame.vue`.

## Definition of Done (Dice)

### Fun mode (обязательно — ADR-014)

Без Phantom и без денег: открыть `/games/dice` → режим **FUN** по умолчанию → ставка/цель/under-over → Roll →
число + win/lose + виртуальный баланс. Тот же RNG (`rng-verify`), анимация `playWinBurst` при выигрыше.

### Live mode

Подключённый Phantom (devnet) может: deposit → bet → roll → verify on Explorer → withdraw. Баланс on-chain.

---

## Шаг 0 — деплой и окружение (терминал на хосте)

```bash
# 1. собрать и задеплоить программу
anchor build
anchor deploy --provider.cluster devnet      # → выведет Program Id
pnpm copy-idl                                  # положит IDL/types туда, где их ждёт фронт

# 2. devnet SPL-токен (один раз)
spl-token create-token --url devnet            # → MINT
spl-token create-account <MINT> --url devnet
spl-token mint <MINT> 1000000 --url devnet

# 3. .env
NUXT_PUBLIC_SOLANA_NETWORK=devnet
NUXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NUXT_PUBLIC_CASINO_PROGRAM_ID=<Program Id>
NUXT_PUBLIC_CASINO_TOKEN_MINT=<MINT>

# 4. инициализировать казино (скрипт или anchor test): initialize(house_edge_bps=200)
```

Обнови `declare_id!` в `lib.rs` и `Anchor.toml` на реальный Program Id, пересобери, `copy-idl`.

После деплоя занеси Program Id и Mint в `ai/CONTEXT.md` (без секретов).

---

## Шаг 1 — Anchor-клиент в `composables/useCasinoProgram.ts`

Добавить реальную программу поверх существующих стабов.

```ts
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram, SYSVAR_RECENT_BLOCKHASHES_PUBKEY } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'
import idl from '~/types/idl/wibe_casino.json'   // путь от pnpm copy-idl

const CASINO_CONFIG_SEED = Buffer.from('casino_config')
const CASINO_VAULT_SEED  = Buffer.from('casino_vault')
const USER_BALANCE_SEED  = Buffer.from('user_balance')
```

- Собрать `provider` из `connection` (`useWallet`) + адаптер над Phantom (`signTransaction`,
  `signAllTransactions`, `publicKey`). Создать `const program = new Program(idl, programId, provider)`.
- PDAs (Anchor 0.30 — имена аккаунтов в snake→camel автоматически):
  ```ts
  const mint = new PublicKey(tokenMint.value)
  const [config]  = PublicKey.findProgramAddressSync([CASINO_CONFIG_SEED, mint.toBuffer()], programId)
  const [vault]   = PublicKey.findProgramAddressSync([CASINO_VAULT_SEED, config.toBuffer()], programId)
  const [userBal] = PublicKey.findProgramAddressSync(
    [USER_BALANCE_SEED, config.toBuffer(), publicKey.toBuffer()], programId)
  ```

## Шаг 2 — `refreshBalance()`

```ts
const acc = await program.account.userBalance.fetchNullable(userBal)
casinoBalance.value = acc ? acc.amount.toNumber() : 0   // amount: BN (base units)
```
(учти decimals минта при выводе в UI — делить на 10^decimals).

## Шаг 3 — `deposit(amount)` / `withdraw(amount)`

```ts
const userAta = getAssociatedTokenAddressSync(mint, publicKey)
await program.methods.deposit(new BN(amount))
  .accounts({ user: publicKey, casinoConfig: config, casinoVault: vault,
              userTokenAccount: userAta, userBalance: userBal,
              systemProgram: SystemProgram.programId, tokenProgram: TOKEN_PROGRAM_ID })
  .rpc()
await refreshBalance()
// UI: playDepositPulse(panelEl) после успеха
```
`withdraw` — те же аккаунты минус system/init, метод `withdraw(new BN(amount))`.

## Шаг 4 — `playDice(...)`

```ts
const userSeed = new BN(crypto.getRandomValues(new BigUint64Array(1))[0].toString())
const sig = await program.methods
  .playDice(new BN(bet), rollUnder, target, userSeed)
  .accounts({ user: publicKey, casinoConfig: config, userBalance: userBal,
              recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY })
  .rpc()
// получить ролл: вариант А — parse событие DicePlayed из логов (program.addEventListener
// или connection.getTransaction(sig,{maxSupportedTransactionVersion:0}) + program.coder.events)
// вариант Б — прочитать game_nonce ДО игры, после игры пересчитать через rng-verify
return { sig, userSeed, target, rollUnder }
```
Верни `{ sig, userSeed, nonceUsed, blockhash }` наружу — нужно для «Verify».
Примечание: `recent_blockhashes` sysvar помечен deprecated, но читается; программа берёт первые 32 байта.

## Шаг 5 — `composables/useGameDice.ts`

Заменить `throw 'play_dice not wired'` на вызов `useCasinoProgram().playDice(...)`:
```ts
const res = await playDice({ bet: bet.value, target: target.value,
                             rollUnder: direction.value === 'under', })
lastRoll.value = res.roll
won.value = res.won
lastTx.value = res   // { sig, userSeed, nonce, blockhash }
await refreshBalance()
// если won → playWinBurst(resultEl)
```
Добавить `won`, `lastTx`, `winChance` (computed: under → (target-1)%, over → (100-target)%).

## Шаг 6 — UI `components/games/DiceGame.vue`

Брутализм, всё на токенах `--bw-*`, тач-таргеты ≥44px, i18n через `UiLocaleText`/`t`.

- Баланс: `WalletBalanceDisplay` + кнопки `games.common.deposit/withdraw` (поле суммы, `max`).
- Ставка: числовой инпут `games.common.bet`.
- Цель: ползунок 2–98 (`games.dice.target`) + тумблер `games.dice.rollUnder/rollOver`.
- Live `games.dice.chance` = winChance.
- Кнопка Roll (`UiBrutalButton`, `loading=playing`); по результату — крупное число через `UiGlitchText`,
  строка `games.common.win|lose` + `payout`.
- «Verify on Explorer» (`games.common.verifyRoll`): ссылка на `https://explorer.solana.com/tx/<sig>?cluster=devnet`
  + локальная проверка (см. шаг 7) с индикатором `verifiedOk/verifiedFail`.
- Ошибки: `try/catch` → `useBrutalToast().showError(mapWibeError(e))`.
- Кнопка назад в лобби — уже есть.

## Шаг 7 — проверка ролла (paranoid player)

```ts
import { verifyDice, base58Decode } from '~/shared/rng-verify'
const r = verifyDice({
  blockhash: base58Decode(lastTx.blockhash), userSeed: BigInt(lastTx.userSeed.toString()),
  nonce: BigInt(lastTx.nonce), rollUnder, target, reportedRoll: lastRoll, reportedWon: won })
verified.value = r.ok
```
`blockhash` берём из контекста транзакции (`getTransaction(sig)` → `transaction.message.recentBlockhash`).

## Шаг 8 — ошибки

`shared/errors.ts` уже содержит коды. Добавить маппер Anchor-ошибок программы
(`InvalidBet/InsufficientBalance/...`) → `WibeErrorCode`, показывать тосты.

---

## Acceptance / QA (Phantom devnet — см. `iterations/help.md`)

1. `pnpm dev`, подключить Phantom (devnet).
2. Deposit 100 → баланс казино +100 (виден on-chain), пульс-анимация.
3. Roll under 50, ставка 10 → выпадает число, баланс меняется корректно (выигрыш = +92 при edge 2%, проигрыш = −10).
4. «Verify» подсвечивает зелёным; ломаем reportedRoll вручную → красный.
5. Withdraw 50 → токены вернулись в кошелёк, баланс −50.
6. Тесты: `pnpm test:env`, `pnpm test:motion`, `pnpm exec vitest run tests/rng-verify.test.ts`, `pnpm test:e2e`, `pnpm build`.

## Подводные камни

- Anchor 0.30: имена аккаунтов в `.accounts({...})` — camelCase от snake_case в Rust.
- `amount`/`game_nonce` — `BN`, не number; следи за decimals минта.
- `init_if_needed` на `user_balance` уже в программе — первый deposit создаст PDA.
- `recent_blockhashes` sysvar deprecated, но рабочий; не заменяй на slot hashes без правки `lib.rs`.
- House edge: бери из `casino_config.house_edge_bps` (инициализировано на шаге 0).

## Затем — слот

`play_slot` устроен так же (3 reels, `computeReels`/`verifySlot` уже есть). После Dice слот = копия
проводки + UI с 3 барабанами (jitter/scanline). Отдельной итерацией.

---

| | |
|---|---|
| **Автор плана** | Claude (Cowork) — ит.3 finalize |
| **Исполнитель** | Cursor (деплой + проводка на хосте) |
| **Причина передачи** | Cowork-лимит сессии ~75%+; нет Solana/Anchor/Phantom в среде Claude |
