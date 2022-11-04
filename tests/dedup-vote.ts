/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { expect } from 'chai';
import { DedupVote } from '../target/types/dedup_vote';

enum Choice {
  pb = 'pb',
  j = 'jelly',
}
describe.only('Solana Deduplicated Vote', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DedupVote as Program<DedupVote>;
  const voteAccount = anchor.web3.Keypair.generate();

  let voterKeys;

  const printVotes = async () => {
    const votes = await program.account.votes.fetch(voteAccount.publicKey);
    console.table({ PB: votes[Choice.pb], Jelly: votes[Choice.j] });
  };

  const testVotes = async (pb, j) => {
    const votes = await program.account.votes.fetch(voteAccount.publicKey);
    expect(votes[Choice.pb]).to.equal(pb);
    expect(votes[Choice.j]).to.equal(j);
  };

  const vote = async (choice: Choice, name: string) => {
    const voterKey = voterKeys[name];
    if (!voterKey) {
      throw Error('missing voter key');
    }
    await program.methods
      .vote(choice)
      .accounts({ votes: voteAccount.publicKey, voter: voterKey.publicKey })
      .signers([voterKey])
      .rpc();
  };

  const voteKyle = async (choice: Choice) => {
    await vote(choice, 'kyle');
  };

  const voteSam = async (choice: Choice) => {
    await vote(choice, 'sam');
  };

  before('Setup vote account and voter keys', async () => {
    await program.methods
      .initialize()
      .accounts({ votes: voteAccount.publicKey })
      .signers([voteAccount])
      .rpc();
    voterKeys = ['kyle', 'sam', 'kyle1', 'kyle2'].reduce((obj, name) => {
      obj[name] = anchor.web3.Keypair.generate();
      return obj;
    }, {});
  });

  afterEach(async function () {
    await printVotes();
  });

  it('starts with zero votes', async function () {
    await testVotes(0, 0);
  });

  it('kyle votes for pb', async function () {
    await voteKyle(Choice.pb);
    await testVotes(1, 0);
  });

  it('kyle votes for jelly', async function () {
    await voteKyle(Choice.j);
    await testVotes(0, 1);
  });

  it('fails when kyle votes alot for pb', async function () {
    try {
      await voteKyle(Choice.pb);
      await voteKyle(Choice.pb);
      await voteKyle(Choice.pb);
      await voteKyle(Choice.pb);
    } catch (e) {
      expect(e).to.exist;
      expect(e.message).to.equal('you already voted!');
    }

    await testVotes(1, 0);
  });

  it('sam votes for jelly', async function () {
    await voteSam(Choice.j);
    await testVotes(1, 1);
  });

  it('sam votes for pb', async function () {
    await voteSam(Choice.pb);
    await testVotes(2, 0);
  });

  it('kyle1 votes for pb', async function () {
    vote(Choice.pb, 'kyle1');
    await testVotes(3, 0);
  });

  it('kyle2 votes for pb', async function () {
    await vote(Choice.pb, 'kyle2');
    await testVotes(4, 0);
  });
});
