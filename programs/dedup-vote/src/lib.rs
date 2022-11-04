use anchor_lang::prelude::*;

declare_id!("5Q4KkEoLHzFNGaDZzfarZ99EbgMpwQsERAyTUuYEqANi");

#[program]
pub mod dedup_vote {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.votes.pb = 0;
        ctx.accounts.votes.jelly = 0;
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, choice: String) -> Result<()> {
        match &choice[..] {
            "pb" => ctx.accounts.votes.pb += 1,
            "jelly" => ctx.accounts.votes.jelly += 1,
            _ => panic!("invalid choice"),
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 2)]
    pub votes: Account<'info, Votes>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub votes: Account<'info, Votes>,
    pub voter: Signer<'info>,
}

#[account]
pub struct Votes {
    pb: u8,
    jelly: u8,
}
