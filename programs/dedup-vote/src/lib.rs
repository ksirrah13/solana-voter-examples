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

    pub fn register(ctx: Context<Register>) -> Result<()> {
        ctx.accounts.my_vote.bump = *ctx.bumps.get("my_vote").unwrap();
        ctx.accounts.my_vote.choice = "".to_string();
        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, choice: String) -> Result<()> {
        let prev_choice = ctx.accounts.my_vote.choice.to_string();
        require!(prev_choice != choice, VoteErrors::DuplicateVote);
        match &prev_choice[..] {
            "pb" => ctx.accounts.votes.pb -= 1,
            "jelly" => ctx.accounts.votes.jelly -= 1,
            _ => (),
        }
        match &choice[..] {
            "pb" => ctx.accounts.votes.pb += 1,
            "jelly" => ctx.accounts.votes.jelly += 1,
            _ => panic!("invalid choice"),
        }
        ctx.accounts.my_vote.choice = choice;
        Ok(())
    }
}

#[error_code]
pub enum VoteErrors {
    #[msg("you already voted!")]
    DuplicateVote,
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
    #[account(mut, 
        seeds = [b"vote", votes.key().as_ref(), voter.key().as_ref()], 
        bump = my_vote.bump)]
    pub my_vote: Account<'info, MyVote>,
    #[account(mut)]
    pub votes: Account<'info, Votes>,
    pub voter: Signer<'info>,
}

#[derive(Accounts)]
pub struct Register<'info> {
    #[account(init, payer = payer, space = 8 + 40 + 1, 
        seeds = [b"vote", votes.key().as_ref(), voter.key().as_ref()], bump)]
    pub my_vote: Account<'info, MyVote>,
    pub votes: Account<'info, Votes>,
    pub voter: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Votes {
    pb: u8,
    jelly: u8,
}

#[account]
pub struct MyVote {
    choice: String,
    bump: u8,
}
