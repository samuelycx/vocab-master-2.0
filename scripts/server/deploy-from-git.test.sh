#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TMP_ROOT="$(mktemp -d /tmp/deploy-from-git-test.XXXXXX)"
trap 'rm -rf "$TMP_ROOT"' EXIT

REMOTE_REPO="$TMP_ROOT/remote.git"
SEED_REPO="$TMP_ROOT/seed"
RELEASE_ROOT="$TMP_ROOT/release-root"
SNAPSHOT_ROOT="$TMP_ROOT/current"
OUTPUT_PATH="$TMP_ROOT/output.txt"

git init --bare "$REMOTE_REPO" >/dev/null
git init "$SEED_REPO" >/dev/null
git -C "$SEED_REPO" config user.name "Codex Test"
git -C "$SEED_REPO" config user.email "codex@example.com"
printf 'runtime smoke test\n' > "$SEED_REPO/README.md"
git -C "$SEED_REPO" add README.md
git -C "$SEED_REPO" commit -m "seed" >/dev/null
git -C "$SEED_REPO" branch -M main
git -C "$SEED_REPO" remote add origin "$REMOTE_REPO"
git -C "$SEED_REPO" push -u origin main >/dev/null
COMMIT_SHA="$(git -C "$SEED_REPO" rev-parse HEAD)"

mkdir -p "$RELEASE_ROOT"
git clone --branch main "$REMOTE_REPO" "$RELEASE_ROOT/repo" >/dev/null 2>&1

mkdir -p "$SNAPSHOT_ROOT/scripts/server" "$SNAPSHOT_ROOT/scripts/sync"
cp "$SOURCE_REPO_ROOT/scripts/server/deploy-from-git.sh" "$SNAPSHOT_ROOT/scripts/server/deploy-from-git.sh"
cp "$SOURCE_REPO_ROOT/scripts/sync/release-metadata.mjs" "$SNAPSHOT_ROOT/scripts/sync/release-metadata.mjs"
chmod +x "$SNAPSHOT_ROOT/scripts/server/deploy-from-git.sh"

bash "$SNAPSHOT_ROOT/scripts/server/deploy-from-git.sh" \
  --dry-run \
  "$RELEASE_ROOT" \
  --sha "$COMMIT_SHA" > "$OUTPUT_PATH"

grep -F "origin_url=$REMOTE_REPO" "$OUTPUT_PATH" >/dev/null
grep -F "resolved_sha=$COMMIT_SHA" "$OUTPUT_PATH" >/dev/null
grep -F "repo_path=$RELEASE_ROOT/repo" "$OUTPUT_PATH" >/dev/null

echo "deploy-from-git runtime smoke test passed"
