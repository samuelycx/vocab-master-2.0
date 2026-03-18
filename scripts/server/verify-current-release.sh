#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/server/verify-current-release.sh [release-root]

Purpose:
  Inspect the current symlink, REVISION file, and release manifest path under a release root.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

RELEASE_ROOT="${1:-/var/www/vocab-master}"
CURRENT_PATH="$RELEASE_ROOT/current"
REVISION_PATH="$CURRENT_PATH/REVISION"
MANIFEST_PATH="$CURRENT_PATH/release-manifest.json"

echo "release_root=$RELEASE_ROOT"
echo "current_path=$CURRENT_PATH"

if [ -L "$CURRENT_PATH" ]; then
  echo "current_target=$(readlink "$CURRENT_PATH")"
else
  echo "current_target=missing"
fi

if [ -f "$REVISION_PATH" ]; then
  echo "current_revision=$(tr -d '\n' < "$REVISION_PATH")"
else
  echo "current_revision=missing"
fi

if [ -f "$MANIFEST_PATH" ]; then
  echo "manifest_path=$MANIFEST_PATH"
else
  echo "manifest_path=missing"
fi
