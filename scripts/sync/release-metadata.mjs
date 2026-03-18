const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

export function buildReleaseMetadata({
  commit,
  target,
  scope,
  releasedAt,
  sourceOfTruth = 'origin/main'
} = {}) {
  return {
    commit: normalizeText(commit),
    target: normalizeText(target),
    scope: normalizeText(scope),
    releasedAt: normalizeText(releasedAt),
    sourceOfTruth: normalizeText(sourceOfTruth) || 'origin/main'
  };
}

export function validateReleaseMetadata(input = {}) {
  const metadata = buildReleaseMetadata(input);
  const errors = [];

  if (!metadata.commit) {
    errors.push({
      field: 'commit',
      code: 'INVALID_COMMIT'
    });
  }

  if (!metadata.target) {
    errors.push({
      field: 'target',
      code: 'INVALID_TARGET'
    });
  }

  if (!metadata.scope) {
    errors.push({
      field: 'scope',
      code: 'INVALID_SCOPE'
    });
  }

  if (!metadata.releasedAt) {
    errors.push({
      field: 'releasedAt',
      code: 'INVALID_RELEASED_AT'
    });
  }

  if (!metadata.sourceOfTruth) {
    errors.push({
      field: 'sourceOfTruth',
      code: 'INVALID_SOURCE_OF_TRUTH'
    });
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
