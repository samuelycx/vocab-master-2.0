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
    target: 'server',
    scope: 'server-web',
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
