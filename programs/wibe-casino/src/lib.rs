/**
 * @agent-context wibe_casino Anchor program — on-chain casino for Brutal wibe.
 * @see ai/specs/game-dice.md, ai/specs/game-slot.md, ai/specs/rng.md
 * @instructions initialize, deposit, withdraw, play_dice, play_slot
 */
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("Wibe1111111111111111111111111111111111111");

pub const CASINO_CONFIG_SEED: &[u8] = b"casino_config";
pub const CASINO_VAULT_SEED: &[u8] = b"casino_vault";
pub const USER_BALANCE_SEED: &[u8] = b"user_balance";

#[program]
pub mod wibe_casino {
    use super::*;

    /// Initializes casino config and vault. Called once by authority.
    pub fn initialize(ctx: Context<Initialize>, house_edge_bps: u16) -> Result<()> {
        require!(house_edge_bps <= 1000, WibeError::InvalidHouseEdge);

        let config = &mut ctx.accounts.casino_config;
        config.authority = ctx.accounts.authority.key();
        config.mint = ctx.accounts.mint.key();
        config.house_edge_bps = house_edge_bps;
        config.bump = ctx.bumps.casino_config;
        config.vault_bump = ctx.bumps.casino_vault;

        Ok(())
    }

    /// Deposits SPL tokens from user wallet into casino balance PDA.
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        require!(amount > 0, WibeError::InvalidAmount);

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.casino_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        let user_balance = &mut ctx.accounts.user_balance;
        user_balance.amount = user_balance
            .amount
            .checked_add(amount)
            .ok_or(WibeError::MathOverflow)?;

        Ok(())
    }

    /// Withdraws SPL tokens from casino balance back to user wallet.
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, WibeError::InvalidAmount);

        let user_balance = &mut ctx.accounts.user_balance;
        require!(user_balance.amount >= amount, WibeError::InsufficientBalance);

        user_balance.amount = user_balance
            .amount
            .checked_sub(amount)
            .ok_or(WibeError::MathOverflow)?;

        let config = &ctx.accounts.casino_config;
        let seeds = &[
            CASINO_VAULT_SEED,
            config.key().as_ref(),
            &[config.vault_bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.casino_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.casino_vault.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        Ok(())
    }

    /// Plays dice: roll 1-100, win if under/over target. Outcome computed on-chain.
    pub fn play_dice(
        ctx: Context<PlayDice>,
        bet: u64,
        roll_under: bool,
        target: u8,
        user_seed: u64,
    ) -> Result<()> {
        require!(bet > 0, WibeError::InvalidBet);
        require!((2..=98).contains(&target), WibeError::InvalidBet);

        let user_balance = &mut ctx.accounts.user_balance;
        require!(user_balance.amount >= bet, WibeError::InsufficientBalance);

        let roll = compute_roll(
            &ctx.accounts.recent_blockhashes,
            user_seed,
            user_balance.game_nonce,
        )?;
        user_balance.game_nonce = user_balance
            .game_nonce
            .checked_add(1)
            .ok_or(WibeError::MathOverflow)?;

        let won = if roll_under {
            roll < target
        } else {
            roll > target
        };

        apply_bet_outcome(user_balance, bet, won, ctx.accounts.casino_config.house_edge_bps)?;

        emit!(DicePlayed {
            player: ctx.accounts.user.key(),
            bet,
            roll,
            target,
            roll_under,
            won,
        });

        Ok(())
    }

    /// Plays broken slot: 3 reels, weighted symbols, payout on-chain.
    pub fn play_slot(ctx: Context<PlaySlot>, bet: u64, user_seed: u64) -> Result<()> {
        require!(bet > 0, WibeError::InvalidBet);

        let user_balance = &mut ctx.accounts.user_balance;
        require!(user_balance.amount >= bet, WibeError::InsufficientBalance);

        let nonce = user_balance.game_nonce;
        user_balance.game_nonce = nonce.checked_add(1).ok_or(WibeError::MathOverflow)?;

        let reel1 = compute_symbol(&ctx.accounts.recent_blockhashes, user_seed, nonce, 0)?;
        let reel2 = compute_symbol(&ctx.accounts.recent_blockhashes, user_seed, nonce, 1)?;
        let reel3 = compute_symbol(&ctx.accounts.recent_blockhashes, user_seed, nonce, 2)?;

        let payout_multiplier = slot_payout_multiplier(reel1, reel2, reel3);
        let won = payout_multiplier > 0;

        if won {
            let gross = bet
                .checked_mul(payout_multiplier as u64)
                .ok_or(WibeError::MathOverflow)?;
            let edge = gross
                .checked_mul(ctx.accounts.casino_config.house_edge_bps as u64)
                .ok_or(WibeError::MathOverflow)?
                / 10_000;
            let payout = gross.checked_sub(edge).ok_or(WibeError::MathOverflow)?;
            user_balance.amount = user_balance
                .amount
                .checked_sub(bet)
                .ok_or(WibeError::MathOverflow)?
                .checked_add(payout)
                .ok_or(WibeError::MathOverflow)?;
        } else {
            user_balance.amount = user_balance
                .amount
                .checked_sub(bet)
                .ok_or(WibeError::MathOverflow)?;
        }

        emit!(SlotPlayed {
            player: ctx.accounts.user.key(),
            bet,
            reel1,
            reel2,
            reel3,
            payout_multiplier,
            won,
        });

        Ok(())
    }
}

fn compute_roll(recent_blockhashes: &AccountInfo, user_seed: u64, nonce: u64) -> Result<u8> {
    let hash = hash_from_inputs(recent_blockhashes, user_seed, nonce, b"dice")?;
    Ok((hash % 100 + 1) as u8)
}

/// Per-reel nonce stride (64-bit golden ratio). A trailing reel byte under FNV-1a is too weakly
/// mixed and made the three reels mod 6 ALWAYS distinct (slot could never pay pairs/triples), so
/// each reel hashes with `nonce + reel*STRIDE`. Must match shared/rng-verify.ts SLOT_REEL_STRIDE.
const SLOT_REEL_STRIDE: u64 = 0x9e3779b97f4a7c15;

fn compute_symbol(
    recent_blockhashes: &AccountInfo,
    user_seed: u64,
    nonce: u64,
    reel: u8,
) -> Result<u8> {
    let reel_nonce = nonce.wrapping_add((reel as u64).wrapping_mul(SLOT_REEL_STRIDE));
    let hash = hash_from_inputs(recent_blockhashes, user_seed, reel_nonce, b"slot")?;
    Ok((hash % 6) as u8)
}

fn hash_from_inputs(
    recent_blockhashes: &AccountInfo,
    user_seed: u64,
    nonce: u64,
    domain: &[u8],
) -> Result<u64> {
    let data = recent_blockhashes.try_borrow_data()?;
    require!(data.len() >= 32, WibeError::InvalidBlockhash);

    let mut buf = [0u8; 48];
    buf[..32].copy_from_slice(&data[0..32]);
    buf[32..40].copy_from_slice(&user_seed.to_le_bytes());
    buf[40..48].copy_from_slice(&nonce.to_le_bytes());

    let mut hash: u64 = 0xcbf29ce484222325;
    for byte in buf.iter().chain(domain.iter()) {
        hash ^= *byte as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    Ok(hash)
}

fn apply_bet_outcome(
    user_balance: &mut Account<UserBalance>,
    bet: u64,
    won: bool,
    house_edge_bps: u16,
) -> Result<()> {
    if won {
        let multiplier_bps: u64 = 19500;
        let gross = bet
            .checked_mul(multiplier_bps)
            .ok_or(WibeError::MathOverflow)?
            / 10_000;
        let edge = gross
            .checked_mul(house_edge_bps as u64)
            .ok_or(WibeError::MathOverflow)?
            / 10_000;
        let payout = gross.checked_sub(edge).ok_or(WibeError::MathOverflow)?;
        user_balance.amount = user_balance
            .amount
            .checked_sub(bet)
            .ok_or(WibeError::MathOverflow)?
            .checked_add(payout)
            .ok_or(WibeError::MathOverflow)?;
    } else {
        user_balance.amount = user_balance
            .amount
            .checked_sub(bet)
            .ok_or(WibeError::MathOverflow)?;
    }
    Ok(())
}

fn slot_payout_multiplier(r1: u8, r2: u8, r3: u8) -> u16 {
    if r1 == r2 && r2 == r3 {
        return 10;
    }
    if r1 == r2 || r2 == r3 || r1 == r3 {
        return 2;
    }
    0
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        space = 8 + CasinoConfig::INIT_SPACE,
        seeds = [CASINO_CONFIG_SEED, mint.key().as_ref()],
        bump
    )]
    pub casino_config: Account<'info, CasinoConfig>,

    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = casino_vault,
        seeds = [CASINO_VAULT_SEED, casino_config.key().as_ref()],
        bump
    )]
    pub casino_vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [CASINO_CONFIG_SEED, casino_config.mint.as_ref()],
        bump = casino_config.bump
    )]
    pub casino_config: Account<'info, CasinoConfig>,

    #[account(
        mut,
        seeds = [CASINO_VAULT_SEED, casino_config.key().as_ref()],
        bump = casino_config.vault_bump
    )]
    pub casino_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == casino_config.mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserBalance::INIT_SPACE,
        seeds = [USER_BALANCE_SEED, casino_config.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [CASINO_CONFIG_SEED, casino_config.mint.as_ref()],
        bump = casino_config.bump
    )]
    pub casino_config: Account<'info, CasinoConfig>,

    #[account(
        mut,
        seeds = [CASINO_VAULT_SEED, casino_config.key().as_ref()],
        bump = casino_config.vault_bump
    )]
    pub casino_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == casino_config.mint
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [USER_BALANCE_SEED, casino_config.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PlayDice<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [CASINO_CONFIG_SEED, casino_config.mint.as_ref()],
        bump = casino_config.bump
    )]
    pub casino_config: Account<'info, CasinoConfig>,

    #[account(
        mut,
        seeds = [USER_BALANCE_SEED, casino_config.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,

    /// CHECK: recent blockhashes sysvar for verifiable RNG
    pub recent_blockhashes: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct PlaySlot<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [CASINO_CONFIG_SEED, casino_config.mint.as_ref()],
        bump = casino_config.bump
    )]
    pub casino_config: Account<'info, CasinoConfig>,

    #[account(
        mut,
        seeds = [USER_BALANCE_SEED, casino_config.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,

    /// CHECK: recent blockhashes sysvar for verifiable RNG
    pub recent_blockhashes: AccountInfo<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct CasinoConfig {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub house_edge_bps: u16,
    pub bump: u8,
    pub vault_bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserBalance {
    pub amount: u64,
    pub game_nonce: u64,
}

#[event]
pub struct DicePlayed {
    pub player: Pubkey,
    pub bet: u64,
    pub roll: u8,
    pub target: u8,
    pub roll_under: bool,
    pub won: bool,
}

#[event]
pub struct SlotPlayed {
    pub player: Pubkey,
    pub bet: u64,
    pub reel1: u8,
    pub reel2: u8,
    pub reel3: u8,
    pub payout_multiplier: u16,
    pub won: bool,
}

#[error_code]
pub enum WibeError {
    #[msg("Invalid bet amount or parameters")]
    InvalidBet,
    #[msg("Insufficient casino balance")]
    InsufficientBalance,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Invalid house edge")]
    InvalidHouseEdge,
    #[msg("Invalid blockhash data")]
    InvalidBlockhash,
}
