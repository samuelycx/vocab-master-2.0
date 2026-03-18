#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/server/bootstrap-git-release-layout.sh [--dry-run] <release-root>

Purpose:
  Prepare a server release root that uses repo/releases/shared/current layout.
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

if (($# != 1)); then
  usage >&2
  exit 1
fi

RELEASE_ROOT="$1"
REPO_PATH="$RELEASE_ROOT/repo"
RELEASES_PATH="$RELEASE_ROOT/releases"
SHARED_PATH="$RELEASE_ROOT/shared"
CURRENT_PATH="$RELEASE_ROOT/current"
BACKUPS_PATH="$RELEASE_ROOT/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_MARKER_PATH="$BACKUPS_PATH/pre-git-migration-$TIMESTAMP"
SHARED_ENV_PATH="$SHARED_PATH/env"
SHARED_PRISMA_PATH="$SHARED_PATH/prisma"
SHARED_UPLOADS_PATH="$SHARED_PATH/uploads"
SHARED_LOGS_PATH="$SHARED_PATH/logs"
SHARED_HISTORY_PATH="$SHARED_PATH/release-history"

print_plan() {
  echo "mode=$([ "$DRY_RUN" = true ] && echo dry-run || echo apply)"
  echo "release_root=$RELEASE_ROOT"
  echo "repo_path=$REPO_PATH"
  echo "releases_path=$RELEASES_PATH"
  echo "shared_path=$SHARED_PATH"
  echo "current_path=$CURRENT_PATH"
  echo "backups_path=$BACKUPS_PATH"
  echo "backup_marker_path=$BACKUP_MARKER_PATH"
  echo "shared_env_path=$SHARED_ENV_PATH"
  echo "shared_prisma_path=$SHARED_PRISMA_PATH"
  echo "shared_uploads_path=$SHARED_UPLOADS_PATH"
  echo "shared_logs_path=$SHARED_LOGS_PATH"
  echo "shared_history_path=$SHARED_HISTORY_PATH"
}

print_plan

if [ "$DRY_RUN" = true ]; then
  exit 0
fi

mkdir -p \
  "$REPO_PATH" \
  "$RELEASES_PATH" \
  "$SHARED_ENV_PATH" \
  "$SHARED_PRISMA_PATH" \
  "$SHARED_UPLOADS_PATH" \
  "$SHARED_LOGS_PATH" \
  "$SHARED_HISTORY_PATH" \
  "$BACKUP_MARKER_PATH"

find "$RELEASE_ROOT" -mindepth 1 -maxdepth 1 \
  ! -name repo \
  ! -name releases \
  ! -name shared \
  ! -name backups \
  ! -name current \
  -print > "$BACKUP_MARKER_PATH/legacy-root-entries.txt"

echo "layout_bootstrap=ok"
