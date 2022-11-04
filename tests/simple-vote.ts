import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { expect } from 'chai';
import { SimpleVote } from '../target/types/simple_vote';

enum Choice {
  pb = 'pb',
  j = 'jelly',
}
describe('Solana Simple Vote', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SimpleVote as Program<SimpleVote>;
  const voteAccount = anchor.web3.Keypair.generate();

  const printVotes = async () => {
    const votes = await program.account.votes.fetch(voteAccount.publicKey);
    console.table({ PB: votes[Choice.pb], Jelly: votes[Choice.j] });
  };

  const testVotes = async (pb, j) => {
    const votes = await program.account.votes.fetch(voteAccount.publicKey);
    expect(votes[Choice.pb]).to.equal(pb);
    expect(votes[Choice.j]).to.equal(j);
  };

  const vote = async (choice: Choice) => {
    await program.methods
      .vote(choice)
      .accounts({ votes: voteAccount.publicKey })
      .rpc();
  };

  before('Setup vote account', async () => {
    await program.methods
      .initialize()
      .accounts({ votes: voteAccount.publicKey })
      .signers([voteAccount])
      .rpc();
  });

  afterEach(async function () {
    await printVotes();
  });

  it('starts with zero votes', async function () {
    await testVotes(0, 0);
  });

  it('votes for pb', async function () {
    await vote(Choice.pb);
    await testVotes(1, 0);
  });

  it('votes for jelly', async function () {
    await vote(Choice.j);
    await testVotes(1, 1);
  });

  it('votes alot for pb', async function () {
    await vote(Choice.pb);
    await vote(Choice.pb);
    await vote(Choice.pb);
    await vote(Choice.pb);

    await testVotes(5, 1);
  });
});
