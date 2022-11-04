/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { afterEach, before, describe } from 'mocha';

enum Choice {
  pb = 1,
  j = 2,
}

const votes = { [Choice.pb]: 0, [Choice.j]: 0 };

const voters = {};

const vote = (choice: Choice, name: string) => {
  if (voters[name] === choice) {
    console.log('Previous vote', { voter: name, vote: voters[name] });
    throw new Error('you already voted!');
  }
  const prevChoice = voters[name];
  voters[name] = choice;
  // move vote from old choice to new
  votes[prevChoice] -= 1;
  votes[choice] += 1;
};

const printVotes = () => {
  console.table({ PB: votes[Choice.pb], Jelly: votes[Choice.j] });
};

describe.only('Protected Vote', () => {
  const testVotes = (pb, j) => {
    expect(votes[Choice.pb]).to.equal(pb);
    expect(votes[Choice.j]).to.equal(j);
  };

  const voteKyle = choice => vote(choice, 'kyle');
  const voteSam = choice => vote(choice, 'sam');

  before('reset votes to zero', () => {
    votes[Choice.pb] = 0;
    votes[Choice.j] = 0;
  });

  afterEach(() => {
    printVotes();
  });

  it('starts with zero votes', () => {
    testVotes(0, 0);
  });

  it('kyle votes for pb', () => {
    voteKyle(Choice.pb);
    testVotes(1, 0);
  });

  it('kyle votes for jelly', () => {
    voteKyle(Choice.j);
    testVotes(0, 1);
  });

  it('fails when kyle votes alot for pb', () => {
    try {
      voteKyle(Choice.pb);
      voteKyle(Choice.pb);
      voteKyle(Choice.pb);
      voteKyle(Choice.pb);
      expect.fail();
    } catch (e) {
      expect(e).to.exist;
      expect(e.message).to.equal('you already voted!');
    }

    testVotes(1, 0);
  });

  it('sam votes for jelly', () => {
    voteSam(Choice.j);
    testVotes(1, 1);
  });

  it('sam votes for pb', () => {
    voteSam(Choice.pb);
    testVotes(2, 0);
  });
});
