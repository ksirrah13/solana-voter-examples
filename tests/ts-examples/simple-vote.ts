/* eslint-disable prefer-arrow-callback */

import { expect } from 'chai';
import { afterEach, before, describe } from 'mocha';

enum Choice {
  pb,
  j,
}

const votes = { [Choice.pb]: 0, [Choice.j]: 0 };

const vote = (choice: Choice) => {
  votes[choice] += 1;
};

const printVotes = () => {
  console.table({ PB: votes[Choice.pb], Jelly: votes[Choice.j] });
};

describe.skip('Simple Vote', function () {
  const testVotes = (pb, j) => {
    expect(votes[Choice.pb]).to.equal(pb);
    expect(votes[Choice.j]).to.equal(j);
  };

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

  it('votes for pb', function () {
    vote(Choice.pb);
    testVotes(1, 0);
  });

  it('votes for jelly', function () {
    vote(Choice.j);
    testVotes(1, 1);
  });

  it('votes alot for pb', function () {
    vote(Choice.pb);
    vote(Choice.pb);
    vote(Choice.pb);
    vote(Choice.pb);

    testVotes(5, 1);
  });
});
