import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProfileSavePlan } from '../src/utils/profile-save.js';
import profileUpdate from '../src/static/cloudfunctions/auth/profile-update.js';

const { buildProfileUpdatePlan } = profileUpdate;

test('requires uploading a local temporary avatar before profile write can proceed', () => {
  const plan = buildProfileSavePlan({
    currentProfile: {
      username: 'Old Name',
      avatar: 'cloud://bucket/avatars/old.png'
    },
    nextProfile: {
      username: 'Alice',
      avatar: 'wxfile://tmp/avatar.png'
    }
  });

  assert.equal(plan.validation.ok, true);
  assert.equal(plan.upload.required, true);
  assert.equal(plan.upload.filePath, 'wxfile://tmp/avatar.png');
  assert.equal(plan.write.allowed, false);
  assert.equal(plan.write.blockedBy, 'upload');

  const resolvedPlan = buildProfileSavePlan({
    currentProfile: {
      username: 'Old Name',
      avatar: 'cloud://bucket/avatars/old.png'
    },
    nextProfile: {
      username: 'Alice',
      avatar: 'wxfile://tmp/avatar.png'
    },
    uploadedAvatar: 'cloud://bucket/avatars/new.png'
  });

  assert.equal(resolvedPlan.write.allowed, true);
  assert.deepEqual(resolvedPlan.write.payload, {
    username: 'Alice',
    avatar: 'cloud://bucket/avatars/new.png',
    previousAvatar: 'cloud://bucket/avatars/old.png'
  });
});

test('skips upload when avatar is already a cloud file reference', () => {
  const plan = buildProfileSavePlan({
    currentProfile: {
      username: 'Old Name',
      avatar: 'cloud://bucket/avatars/old.png'
    },
    nextProfile: {
      username: 'Alice',
      avatar: 'cloud://bucket/avatars/current.png'
    }
  });

  assert.equal(plan.validation.ok, true);
  assert.equal(plan.upload.required, false);
  assert.equal(plan.write.allowed, true);
  assert.deepEqual(plan.write.payload, {
    username: 'Alice',
    avatar: 'cloud://bucket/avatars/current.png',
    previousAvatar: 'cloud://bucket/avatars/old.png'
  });
});

test('rejects empty or reserved nicknames before cloud write', () => {
  const emptyPlan = buildProfileUpdatePlan({
    username: '   ',
    avatar: 'cloud://bucket/avatars/current.png',
    previousAvatar: 'cloud://bucket/avatars/old.png'
  });

  assert.equal(emptyPlan.validation.ok, false);
  assert.equal(emptyPlan.write.allowed, false);
  assert.equal(emptyPlan.validation.errors[0].code, 'INVALID_NICKNAME');

  const reservedPlan = buildProfileUpdatePlan({
    username: '准备出发的小萌新',
    avatar: 'cloud://bucket/avatars/current.png',
    previousAvatar: 'cloud://bucket/avatars/old.png'
  });

  assert.equal(reservedPlan.validation.ok, false);
  assert.equal(reservedPlan.write.allowed, false);
  assert.equal(reservedPlan.validation.errors[0].code, 'INVALID_NICKNAME');
});

test('produces a cleanup plan that removes the newly uploaded avatar if the write fails', () => {
  const plan = buildProfileUpdatePlan({
    username: 'Alice',
    avatar: 'cloud://bucket/avatars/new.png',
    previousAvatar: 'cloud://bucket/avatars/old.png',
    uploadedAvatar: 'cloud://bucket/avatars/new.png'
  });

  assert.equal(plan.validation.ok, true);
  assert.deepEqual(plan.cleanup.onWriteFailure, [
    {
      type: 'delete-file',
      fileID: 'cloud://bucket/avatars/new.png',
      reason: 'rollback-new-avatar-upload'
    }
  ]);
});

test('marks the old managed avatar for deletion after a successful replacement', () => {
  const plan = buildProfileUpdatePlan({
    username: 'Alice',
    avatar: 'cloud://bucket/avatars/new.png',
    previousAvatar: 'cloud://bucket/avatars/old.png',
    uploadedAvatar: 'cloud://bucket/avatars/new.png'
  });

  assert.equal(plan.validation.ok, true);
  assert.deepEqual(plan.cleanup.onWriteSuccess, [
    {
      type: 'delete-file',
      fileID: 'cloud://bucket/avatars/old.png',
      reason: 'delete-replaced-avatar'
    }
  ]);
});
