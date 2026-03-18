import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_LEADERBOARD_AVATAR,
  DEFAULT_LEADERBOARD_NAME,
  normalizeLeaderboardEntry,
  normalizeLeaderboardEntries
} from '../src/utils/leaderboard.js';
import leaderboardView from '../src/static/cloudfunctions/progress/leaderboard-view.js';

const { buildLeaderboardView, normalizeLeaderboardRow } = leaderboardView;

test('normalizeLeaderboardEntry keeps cloud avatar and explicit profile fields', () => {
  const entry = normalizeLeaderboardEntry(
    {
      _id: 'user-1',
      username: 'Alice',
      avatar: 'cloud://bucket/avatar.png',
      level: '3',
      xp: '120',
      totalCorrect: '45',
      rank: 7,
      isProfileSet: false
    },
    0
  );

  assert.deepEqual(entry, {
    id: 'user-1',
    displayName: 'Alice',
    avatar: 'cloud://bucket/avatar.png',
    level: 3,
    xp: 120,
    totalCorrect: 45,
    rank: 7,
    isProfileSet: true
  });
});

test('normalizeLeaderboardEntry falls back to the existing default avatar semantic', () => {
  const entry = normalizeLeaderboardEntry({ id: 'user-2', username: 'Bob', avatar: '   ' }, 1);

  assert.equal(entry.avatar, DEFAULT_LEADERBOARD_AVATAR);
  assert.equal(entry.displayName, 'Bob');
  assert.equal(entry.isProfileSet, true);
  assert.equal(entry.rank, 2);
});

test('normalizeLeaderboardEntry falls back to the existing placeholder display name semantic', () => {
  const entry = normalizeLeaderboardEntry({ id: 'user-3', username: '   ', avatar: '' }, 2);

  assert.equal(entry.displayName, DEFAULT_LEADERBOARD_NAME);
  assert.equal(entry.avatar, DEFAULT_LEADERBOARD_AVATAR);
  assert.equal(entry.isProfileSet, false);
  assert.equal(entry.rank, 3);
});

test('normalizeLeaderboardEntries fills missing rank from list index and keeps contract fields stable', () => {
  const [entry] = normalizeLeaderboardEntries([
    {
      openid: 'openid-1',
      nickname: 'Carol',
      level: null,
      xp: undefined,
      totalCorrect: '9'
    }
  ]);

  assert.deepEqual(Object.keys(entry), [
    'id',
    'displayName',
    'avatar',
    'level',
    'xp',
    'totalCorrect',
    'rank',
    'isProfileSet'
  ]);
  assert.deepEqual(entry, {
    id: 'openid-1',
    displayName: 'Carol',
    avatar: DEFAULT_LEADERBOARD_AVATAR,
    level: 1,
    xp: 0,
    totalCorrect: 9,
    rank: 1,
    isProfileSet: true
  });
});

test('cloud leaderboard view returns the same normalized contract', () => {
  const rows = buildLeaderboardView([
    {
      _id: 'user-4',
      username: '',
      avatar: 'not-a-url',
      level: '8',
      xp: '320',
      totalCorrect: '88'
    }
  ]);

  assert.deepEqual(rows, [
    {
      id: 'user-4',
      displayName: DEFAULT_LEADERBOARD_NAME,
      avatar: DEFAULT_LEADERBOARD_AVATAR,
      level: 8,
      xp: 320,
      totalCorrect: 88,
      rank: 1,
      isProfileSet: false
    }
  ]);
  assert.deepEqual(normalizeLeaderboardRow({ id: 'user-5', username: 'Dana', avatar: '' }, 4), {
    id: 'user-5',
    displayName: 'Dana',
    avatar: DEFAULT_LEADERBOARD_AVATAR,
    level: 1,
    xp: 0,
    totalCorrect: 0,
    rank: 5,
    isProfileSet: true
  });
});
