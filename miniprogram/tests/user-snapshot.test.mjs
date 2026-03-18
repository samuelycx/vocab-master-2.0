import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const frontendModuleUrl = new URL('../src/utils/user-snapshot.js', import.meta.url);
const cloudModulePath = new URL('../src/static/cloudfunctions/auth/user-snapshot.js', import.meta.url);

const frontend = await import(frontendModuleUrl);
const cloud = await loadCloudModule(cloudModulePath);

function loadCloudModule(fileUrl) {
  return readFile(fileUrl, 'utf8').then((source) => {
    const module = { exports: {} };
    const context = vm.createContext({
      module,
      exports: module.exports,
      require(name) {
        throw new Error(`Unexpected require in cloud helper: ${name}`);
      },
      console
    });

    vm.runInContext(source, context, { filename: fileUrl.pathname });
    return module.exports;
  });
}

function expectCanonicalSnapshot(snapshot) {
  assert.deepEqual(Object.keys(snapshot), [
    'id',
    'openid',
    'username',
    'avatar',
    'role',
    'level',
    'xp',
    'coins',
    'streak',
    'totalCorrect',
    'isProfileSet'
  ]);
}

function toPlainObject(value) {
  return JSON.parse(JSON.stringify(value));
}

test('normalizes placeholder user with safe defaults', () => {
  const input = { openid: 'openid-placeholder' };

  const result = frontend.normalizeUserSnapshot(input);

  expectCanonicalSnapshot(result);
  assert.equal(result.id, 'openid-placeholder');
  assert.equal(result.openid, 'openid-placeholder');
  assert.equal(result.username, frontend.DEFAULT_USERNAME);
  assert.equal(result.avatar, frontend.DEFAULT_AVATAR);
  assert.equal(result.role, 'USER');
  assert.equal(result.level, 1);
  assert.equal(result.xp, 0);
  assert.equal(result.coins, 0);
  assert.equal(result.streak, 0);
  assert.equal(result.totalCorrect, 0);
  assert.equal(result.isProfileSet, false);
});

test('uses document identifiers and infers profile completion from custom profile data', () => {
  const input = {
    _id: 'doc-user-1',
    openid: 'openid-user-1',
    username: 'Alice',
    avatar: 'https://example.com/avatar.png',
    role: 'ADMIN',
    level: 7,
    xp: 99,
    coins: 88,
    streak: 6,
    totalCorrect: 123
  };

  const result = frontend.normalizeUserSnapshot(input);

  expectCanonicalSnapshot(result);
  assert.equal(result.id, 'doc-user-1');
  assert.equal(result.openid, 'openid-user-1');
  assert.equal(result.username, 'Alice');
  assert.equal(result.avatar, 'https://example.com/avatar.png');
  assert.equal(result.role, 'ADMIN');
  assert.equal(result.level, 7);
  assert.equal(result.xp, 99);
  assert.equal(result.coins, 88);
  assert.equal(result.streak, 6);
  assert.equal(result.totalCorrect, 123);
  assert.equal(result.isProfileSet, true);
});

test('treats explicit placeholder profile as not set even when isProfileSet is truthy', () => {
  const input = {
    id: 'user-2',
    openid: 'openid-user-2',
    username: frontend.DEFAULT_USERNAME,
    avatar: frontend.DEFAULT_AVATAR,
    isProfileSet: true
  };

  const result = frontend.normalizeUserSnapshot(input);

  assert.equal(result.isProfileSet, false);
});

test('cloud helper matches frontend helper output for mixed legacy payloads', () => {
  const input = {
    _id: 'legacy-doc-id',
    username: '  ',
    avatar: '',
    level: undefined,
    xp: Number.NaN,
    coins: null,
    streak: '5',
    totalCorrect: undefined,
    isProfileSet: false
  };

  const frontendResult = frontend.normalizeUserSnapshot(input);
  const cloudResult = cloud.normalizeUserSnapshot(input);

  assert.deepEqual(toPlainObject(cloudResult), toPlainObject(frontendResult));
  assert.equal(cloudResult.id, 'legacy-doc-id');
  assert.equal(cloudResult.openid, 'legacy-doc-id');
  assert.equal(cloudResult.level, 1);
  assert.equal(cloudResult.xp, 0);
  assert.equal(cloudResult.coins, 0);
  assert.equal(cloudResult.streak, 5);
  assert.equal(cloudResult.totalCorrect, 0);
  assert.equal(cloudResult.isProfileSet, false);
});

test('mergeUserState keeps non-canonical stats for the same user while normalizing snapshot fields', () => {
  assert.equal(typeof frontend.mergeUserState, 'function');

  const currentUser = {
    id: 'user-merge-1',
    openid: 'openid-merge-1',
    username: 'Alice',
    avatar: frontend.DEFAULT_AVATAR,
    level: 2,
    xp: 15,
    totalLearned: 31,
    achievements: [{ achievementId: 'growth_first_use' }],
    rankTitle: 'Explorer'
  };

  const incomingSnapshot = {
    id: 'user-merge-1',
    openid: 'openid-merge-1',
    username: 'Alice Cooper',
    avatar: 'cloud://bucket/avatar.png',
    level: '3',
    xp: '44',
    totalCorrect: '18',
    isProfileSet: true
  };

  const result = frontend.mergeUserState(currentUser, incomingSnapshot);

  assert.equal(result.username, 'Alice Cooper');
  assert.equal(result.avatar, 'cloud://bucket/avatar.png');
  assert.equal(result.level, 3);
  assert.equal(result.xp, 44);
  assert.equal(result.totalCorrect, 18);
  assert.equal(result.totalLearned, 31);
  assert.deepEqual(result.achievements, [{ achievementId: 'growth_first_use' }]);
  assert.equal(result.rankTitle, 'Explorer');
});

test('mergeUserState drops stale extra fields when the identity changes', () => {
  assert.equal(typeof frontend.mergeUserState, 'function');

  const previousUser = {
    id: 'old-user',
    openid: 'openid-old-user',
    username: 'Old User',
    totalLearned: 99,
    achievements: [{ achievementId: 'legacy_badge' }]
  };

  const nextUser = {
    id: 'new-user',
    openid: 'openid-new-user',
    username: 'New User'
  };

  const result = frontend.mergeUserState(previousUser, nextUser);

  assert.equal(result.id, 'new-user');
  assert.equal(result.openid, 'openid-new-user');
  assert.equal(result.username, 'New User');
  assert.equal('totalLearned' in result, false);
  assert.equal('achievements' in result, false);
});
