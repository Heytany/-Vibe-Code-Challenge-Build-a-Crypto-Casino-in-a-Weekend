/**
 * @agent-context Shared error codes — must stay in sync with programs/wibe-casino/src/lib.rs #[error_code].
 * @see ai/decisions/004-ai-folder-conventions.md
 */

export enum WibeErrorCode {
  WalletNotConnected = 'WALLET_NOT_CONNECTED',
  WalletRejected = 'WALLET_REJECTED',
  RpcUnreachable = 'RPC_UNREACHABLE',
  ProgramNotConfigured = 'PROGRAM_NOT_CONFIGURED',
  InsufficientBalance = 'INSUFFICIENT_BALANCE',
  InvalidBet = 'INVALID_BET',
  TransactionFailed = 'TRANSACTION_FAILED',
  EnvInvalid = 'ENV_INVALID',
}

export const WIBE_ERROR_MESSAGES: Record<WibeErrorCode, string> = {
  [WibeErrorCode.WalletNotConnected]: 'Connect Phantom to continue.',
  [WibeErrorCode.WalletRejected]: 'Wallet rejected the transaction.',
  [WibeErrorCode.RpcUnreachable]: 'Cannot reach Solana RPC. Check NUXT_PUBLIC_SOLANA_RPC_URL.',
  [WibeErrorCode.ProgramNotConfigured]: 'Casino program ID missing. Deploy contract and set NUXT_PUBLIC_CASINO_PROGRAM_ID.',
  [WibeErrorCode.InsufficientBalance]: 'Insufficient casino balance for this bet.',
  [WibeErrorCode.InvalidBet]: 'Bet amount or game parameters are invalid.',
  [WibeErrorCode.TransactionFailed]: 'On-chain transaction failed.',
  [WibeErrorCode.EnvInvalid]: 'Environment configuration is invalid.',
}

export class WibeError extends Error {
  constructor(
    public readonly code: WibeErrorCode,
    message?: string,
  ) {
    super(message ?? WIBE_ERROR_MESSAGES[code])
    this.name = 'WibeError'
  }
}
