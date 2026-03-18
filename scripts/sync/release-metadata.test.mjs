import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReleaseMetadata,
  validateReleaseMetadata
} from './release-metadata.mjs';

test('buildReleaseMetadata returns a stable release manifest shape', () => {
  const releasedAt = '2026-03-18T21:00:00.000Z';
  const metadata = buildReleaseMetadata({
    commit: '748268f',
    target: 'server',
    scope: 'server-web',
    releasedAt
  });

  assert.deepEqual(metadata, {
    commit: '748268f',
    target: 'server',
    scope: 'server-web',
    releasedAt,
    sourceOfTruth: 'origin/main'
  });
});

test('validateReleaseMetadata accepts a complete manifest', () => {
  const metadata = {
    commit: '748268f',
    target: 'miniprogram',
    scope: 'cloudfunctions',
    releasedAt: '2026-03-18T21:05:00.000Z',
    sourceOfTruth: 'origin/main'
  };

  assert.deepEqual(validateReleaseMetadata(metadata), {
    ok: true,
    errors: []
  });
});

test('validateReleaseMetadata rejects an empty commit', () => {
  const result = validateReleaseMetadata({
    commit: '   ',
    target: 'miniprogram',
    scope: 'cloudfunctions',
    releasedAt: '2026-03-18T21:10:00.000Z',
    sourceOfTruth: 'origin/main'
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    {
      field: 'commit',
      code: 'INVALID_COMMIT'
    }
  ]);
});

test('buildReleaseMetadata keeps server release evidence fields when provided', () => {
  const releasedAt = '2026-03-18T22:30:00.000Z';
  const metadata = buildReleaseMetadata({
    commit: '266e8e8',
    target: 'server',
    scope: 'server-web',
    releasedAt,
    releasePath: '/var/www/vocab-master/releases/266e8e8',
    currentPath: '/var/www/vocab-master/current'
  });

  assert.deepEqual(metadata, {
    commit: '266e8e8',
    target: 'server',
    scope: 'server-web',
    releasedAt,
    sourceOfTruth: 'origin/main',
    releasePath: '/var/www/vocab-master/releases/266e8e8',
    currentPath: '/var/www/vocab-master/current'
  });
});

test('validateReleaseMetadata rejects a server manifest without release evidence paths', () => {
  const result = validateReleaseMetadata({
    commit: '266e8e8',
    target: 'server',
    scope: 'server-web',
    releasedAt: '2026-03-18T22:35:00.000Z',
    sourceOfTruth: 'origin/main',
    releasePath: '   ',
    currentPath: ''
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    {
      field: 'releasePath',
      code: 'INVALID_RELEASE_PATH'
    },
    {
      field: 'currentPath',
      code: 'INVALID_CURRENT_PATH'
    }
  ]);
});
