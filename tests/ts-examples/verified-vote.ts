/* eslint-disable prefer-arrow-callback */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { afterEach, before, describe } from 'mocha';

enum Choice {
  pb,
  j,
}

const votes = { [Choice.pb]: 0, [Choice.j]: 0 };

const voters = {};

const authorizedVoters: Record<string, { auth: string; age: number }> = {
  kyle: { auth: 'youKilledKenny', age: 50 },
  sam: { auth: 'toitles', age: 7 },
};

const isVoterAuthorized = (name: string, auth: string) => {
  const authRecord = authorizedVoters[name];
  if (!authRecord) {
    return false;
  }
  if (authRecord.auth !== auth) {
    return false;
  }
  if (authRecord.age < 8) {
    return false;
  }
  return true;
};

const vote = (choice: Choice, name: string, auth: string) => {
  if (!isVoterAuthorized(name, auth)) {
    throw new Error('unauthorized voter!');
  }
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

describe.skip('Verified Vote', function () {
  const testVotes = (pb, j) => {
    expect(votes[Choice.pb]).to.equal(pb);
    expect(votes[Choice.j]).to.equal(j);
  };

  const voteKyle = choice => vote(choice, 'kyle', 'youKilledKenny');
  const voteSam = choice => vote(choice, 'sam', 'toitles');

  before('reset votes to zero', function () {
    votes[Choice.pb] = 0;
    votes[Choice.j] = 0;
  });

  afterEach(function () {
    printVotes();
  });

  it('starts with zero votes', function () {
    testVotes(0, 0);
  });

  it('kyle votes for pb', function () {
    voteKyle(Choice.pb);
    testVotes(1, 0);
  });

  it('kyle votes for jelly', function () {
    voteKyle(Choice.j);
    testVotes(0, 1);
  });

  it('fails when kyle votes alot for pb', function () {
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

  it('fails when sam votes (underage)', function () {
    try {
      voteSam(Choice.j);
    } catch (e) {
      expect(e).to.exist;
      expect(e.message).to.equal('unauthorized voter!');
    }
    testVotes(1, 0);
  });

  it('fails when kyle votes with wrong auth', function () {
    try {
      vote(Choice.j, 'kyle', 'wrong!');
    } catch (e) {
      expect(e).to.exist;
      expect(e.message).to.equal('unauthorized voter!');
    }
    testVotes(1, 0);
  });

  it('fails when jan votes ', function () {
    try {
      vote(Choice.j, 'jan', 'letmein');
    } catch (e) {
      expect(e).to.exist;
      expect(e.message).to.equal('unauthorized voter!');
    }
    testVotes(1, 0);
  });
});
