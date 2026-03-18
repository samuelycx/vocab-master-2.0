import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MINIPROGRAM_RELEASE_SCOPES,
  assertProductionManifestAllowed,
  buildMiniprogramReleaseManifest,
  validateMiniprogramReleaseManifest
} from './write-release-manifest.mjs';

test('buildMiniprogramReleaseManifest returns git-based manifest fields', () => {
  const releasedAt = '2026-03-18T23:10:00.000Z';
  const manifest = buildMiniprogramReleaseManifest({
    commit: 'c8a8814',
    scope: 'full',
    releasedAt,
    cloudFunctions: ['admin', 'auth', 'progress', 'words']
  });

  assert.deepEqual(manifest, {
    commit: 'c8a8814',
    scope: 'full',
    releasedAt,
    sourceOfTruth: 'origin/main',
    cloudFunctions: ['admin', 'auth', 'progress', 'words']
  });
});

test('assertProductionManifestAllowed rejects dirty working tree output', () => {
  assert.throws(
    () =>
      assertProductionManifestAllowed({
        gitStatusOutput: ' M miniprogram/src/App.vue',
        dryRun: false
      }),
    /DIRTY_WORKING_TREE/,
  );

  assert.doesNotThrow(() =>
    assertProductionManifestAllowed({
      gitStatusOutput: ' M miniprogram/src/App.vue',
      dryRun: true
    }),
  );
});

test('validateMiniprogramReleaseManifest accepts the supported scopes', () => {
  for (const scope of MINIPROGRAM_RELEASE_SCOPES) {
    const result = validateMiniprogramReleaseManifest({
      commit: 'c8a8814',
      scope,
      releasedAt: '2026-03-18T23:15:00.000Z',
      sourceOfTruth: 'origin/main',
      cloudFunctions: ['auth']
    });

    assert.deepEqual(result, {
      ok: true,
      errors: []
    });
  }
});
