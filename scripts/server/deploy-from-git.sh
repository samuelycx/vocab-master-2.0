#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/server/deploy-from-git.sh [--dry-run] <release-root> --sha <commit-ish>

Purpose:
  Fetch a specific Git SHA into repo/ and expand it as an immutable release under releases/<sha>.
EOF
}

DRY_RUN=false

while (($# > 0)); do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      break
      ;;
  esac
done

if (($# < 3)); then
  usage >&2
  exit 1
fi

RELEASE_ROOT="$1"
shift

if [ "${1:-}" != "--sha" ] || [ -z "${2:-}" ]; then
  usage >&2
  exit 1
fi

SHA_INPUT="$2"
RELEASE_SCOPE="${RELEASE_SCOPE:-server-web}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"

REPO_PATH="$RELEASE_ROOT/repo"
RELEASES_PATH="$RELEASE_ROOT/releases"
SHARED_PATH="$RELEASE_ROOT/shared"
CURRENT_PATH="$RELEASE_ROOT/current"
RELEASE_PATH=""
SHARED_ENV_PATH="$SHARED_PATH/env"
SHARED_PRISMA_PATH="$SHARED_PATH/prisma"
SHARED_UPLOADS_PATH="$SHARED_PATH/uploads"
SHARED_LOGS_PATH="$SHARED_PATH/logs"
SHARED_HISTORY_PATH="$SHARED_PATH/release-history"
MANIFEST_PATH="$CURRENT_PATH/release-manifest.json"
HISTORY_MANIFEST_PATH=""

source_repo_is_git() {
  git -C "$SOURCE_REPO_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

resolve_origin_url() {
  if [ -n "${GIT_ORIGIN_URL:-}" ]; then
    printf '%s' "$GIT_ORIGIN_URL"
    return 0
  fi

  if [ -d "$REPO_PATH/.git" ]; then
    local repo_origin_url
    repo_origin_url="$(git -C "$REPO_PATH" config --get remote.origin.url || true)"
    if [ -n "$repo_origin_url" ]; then
      printf '%s' "$repo_origin_url"
      return 0
    fi
  fi

  if source_repo_is_git; then
    local source_origin_url
    source_origin_url="$(git -C "$SOURCE_REPO_ROOT" config --get remote.origin.url || true)"
    if [ -n "$source_origin_url" ]; then
      printf '%s' "$source_origin_url"
      return 0
    fi
  fi

  return 1
}

resolve_sha_from_available_git_context() {
  local resolved_sha=""

  if [ -d "$REPO_PATH/.git" ]; then
    resolved_sha="$(git -C "$REPO_PATH" rev-parse "$SHA_INPUT^{commit}" 2>/dev/null || true)"
    if [ -n "$resolved_sha" ]; then
      printf '%s' "$resolved_sha"
      return 0
    fi
  fi

  if source_repo_is_git; then
    resolved_sha="$(git -C "$SOURCE_REPO_ROOT" rev-parse "$SHA_INPUT^{commit}" 2>/dev/null || true)"
    if [ -n "$resolved_sha" ]; then
      printf '%s' "$resolved_sha"
      return 0
    fi
  fi

  return 1
}

ORIGIN_URL="$(resolve_origin_url || true)"
if [ -z "$ORIGIN_URL" ]; then
  echo "error=missing_origin_url" >&2
  exit 1
fi

RESOLVED_SHA="$(resolve_sha_from_available_git_context || true)"
if [ -z "$RESOLVED_SHA" ] && [ "$DRY_RUN" = true ]; then
  echo "error=missing_git_context_for_dry_run_sha_resolution" >&2
  exit 1
fi
RELEASE_PATH="$RELEASES_PATH/${RESOLVED_SHA:-unresolved}"
HISTORY_MANIFEST_PATH="$SHARED_HISTORY_PATH/$TIMESTAMP-${RESOLVED_SHA:-unresolved}.json"

print_plan() {
  echo "mode=$([ "$DRY_RUN" = true ] && echo dry-run || echo apply)"
  echo "release_root=$RELEASE_ROOT"
  echo "origin_url=$ORIGIN_URL"
  echo "resolved_sha=$RESOLVED_SHA"
  echo "repo_path=$REPO_PATH"
  echo "release_path=$RELEASE_PATH"
  echo "current_path=$CURRENT_PATH"
  echo "shared_env_path=$SHARED_ENV_PATH"
  echo "shared_prisma_path=$SHARED_PRISMA_PATH"
  echo "shared_uploads_path=$SHARED_UPLOADS_PATH"
  echo "shared_logs_path=$SHARED_LOGS_PATH"
  echo "manifest_path=$MANIFEST_PATH"
  echo "history_manifest_path=$HISTORY_MANIFEST_PATH"
}

print_plan

if [ "$DRY_RUN" = true ]; then
  exit 0
fi

mkdir -p "$REPO_PATH" "$RELEASES_PATH" "$SHARED_HISTORY_PATH"

if [ ! -d "$REPO_PATH/.git" ]; then
  rm -rf "$REPO_PATH"
  git clone "$ORIGIN_URL" "$REPO_PATH"
fi

git -C "$REPO_PATH" fetch origin
RESOLVED_SHA="$(git -C "$REPO_PATH" rev-parse "$SHA_INPUT^{commit}")"
RELEASE_PATH="$RELEASES_PATH/$RESOLVED_SHA"
HISTORY_MANIFEST_PATH="$SHARED_HISTORY_PATH/$TIMESTAMP-$RESOLVED_SHA.json"
git -C "$REPO_PATH" rev-parse "$RESOLVED_SHA^{commit}" >/dev/null

rm -rf "$RELEASE_PATH"
mkdir -p "$RELEASE_PATH"
git -C "$REPO_PATH" archive "$RESOLVED_SHA" | tar -x -C "$RELEASE_PATH"

echo "$RESOLVED_SHA" > "$RELEASE_PATH/REVISION"
ln -sfn "$RELEASE_PATH" "$CURRENT_PATH"

node --input-type=module - \
  "$SOURCE_REPO_ROOT/scripts/sync/release-metadata.mjs" \
  "$RESOLVED_SHA" \
  "$RELEASE_SCOPE" \
  "$RELEASE_PATH" \
  "$CURRENT_PATH" \
  "$MANIFEST_PATH" \
  "$HISTORY_MANIFEST_PATH" <<'EOF'
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const [
  metadataModulePath,
  commit,
  scope,
  releasePath,
  currentPath,
  manifestPath,
  historyManifestPath
] = process.argv.slice(2);

const { buildReleaseMetadata, validateReleaseMetadata } = await import(
  pathToFileURL(metadataModulePath).href
);

const metadata = buildReleaseMetadata({
  commit,
  target: 'server',
  scope,
  releasedAt: new Date().toISOString(),
  releasePath,
  currentPath
});
const validation = validateReleaseMetadata(metadata);

if (!validation.ok) {
  console.error(JSON.stringify(validation.errors));
  process.exit(1);
}

const payload = `${JSON.stringify(metadata, null, 2)}\n`;
writeFileSync(manifestPath, payload);
writeFileSync(historyManifestPath, payload);
EOF

echo "deploy_from_git=ok"
