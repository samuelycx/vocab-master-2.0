const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

export function buildReleaseMetadata({
  commit,
  target,
  scope,
  releasedAt,
  sourceOfTruth = 'origin/main',
  releasePath,
  currentPath
} = {}) {
  const metadata = {
    commit: normalizeText(commit),
    target: normalizeText(target),
    scope: normalizeText(scope),
    releasedAt: normalizeText(releasedAt),
    sourceOfTruth: normalizeText(sourceOfTruth) || 'origin/main'
  };

  const normalizedReleasePath = normalizeText(releasePath);
  if (normalizedReleasePath) {
    metadata.releasePath = normalizedReleasePath;
  }

  const normalizedCurrentPath = normalizeText(currentPath);
  if (normalizedCurrentPath) {
    metadata.currentPath = normalizedCurrentPath;
  }

  return metadata;
}

function pushError(errors, field, code) {
  errors.push({
    field,
    code
  });
}

function validateServerReleaseEvidence(metadata, errors) {
  if (!metadata.releasePath) {
    pushError(errors, 'releasePath', 'INVALID_RELEASE_PATH');
  }

  if (!metadata.currentPath) {
    pushError(errors, 'currentPath', 'INVALID_CURRENT_PATH');
  }
}

export function validateReleaseMetadata(input = {}) {
  const metadata = buildReleaseMetadata(input);
  const errors = [];

  if (!metadata.commit) {
    pushError(errors, 'commit', 'INVALID_COMMIT');
  }

  if (!metadata.target) {
    pushError(errors, 'target', 'INVALID_TARGET');
  }

  if (!metadata.scope) {
    pushError(errors, 'scope', 'INVALID_SCOPE');
  }

  if (!metadata.releasedAt) {
    pushError(errors, 'releasedAt', 'INVALID_RELEASED_AT');
  }

  if (!metadata.sourceOfTruth) {
    pushError(errors, 'sourceOfTruth', 'INVALID_SOURCE_OF_TRUTH');
  }

  if (metadata.target === 'server') {
    validateServerReleaseEvidence(metadata, errors);
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
