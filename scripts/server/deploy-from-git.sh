#!/usr/bin/env bash
set -euo pipefail

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
RESOLVED_SHA="$(git rev-parse "$SHA_INPUT^{commit}")"
ORIGIN_URL="$(git config --get remote.origin.url)"

REPO_PATH="$RELEASE_ROOT/repo"
RELEASES_PATH="$RELEASE_ROOT/releases"
SHARED_PATH="$RELEASE_ROOT/shared"
CURRENT_PATH="$RELEASE_ROOT/current"
RELEASE_PATH="$RELEASES_PATH/$RESOLVED_SHA"
SHARED_ENV_PATH="$SHARED_PATH/env"
SHARED_PRISMA_PATH="$SHARED_PATH/prisma"
SHARED_UPLOADS_PATH="$SHARED_PATH/uploads"
SHARED_LOGS_PATH="$SHARED_PATH/logs"

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
}

print_plan

if [ "$DRY_RUN" = true ]; then
  exit 0
fi

mkdir -p "$REPO_PATH" "$RELEASES_PATH"

if [ ! -d "$REPO_PATH/.git" ]; then
  rm -rf "$REPO_PATH"
  git clone "$ORIGIN_URL" "$REPO_PATH"
fi

git -C "$REPO_PATH" fetch origin
git -C "$REPO_PATH" rev-parse "$RESOLVED_SHA^{commit}" >/dev/null

rm -rf "$RELEASE_PATH"
mkdir -p "$RELEASE_PATH"
git -C "$REPO_PATH" archive "$RESOLVED_SHA" | tar -x -C "$RELEASE_PATH"

echo "$RESOLVED_SHA" > "$RELEASE_PATH/REVISION"
ln -sfn "$RELEASE_PATH" "$CURRENT_PATH"

echo "deploy_from_git=ok"
