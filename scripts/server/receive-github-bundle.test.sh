#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TMP_ROOT="$(mktemp -d /tmp/receive-github-bundle-test.XXXXXX)"
trap 'rm -rf "$TMP_ROOT"' EXIT

BUNDLE_PATH="$TMP_ROOT/main.bundle"
ORIGIN_PATH="$TMP_ROOT/origin.git"
BOOTSTRAP_PATH="$TMP_ROOT/bootstrap"
RELEASE_ROOT="$TMP_ROOT/release-root"
OUTPUT_PATH="$TMP_ROOT/output.txt"
SHA="$(git -C "$REPO_ROOT" rev-parse main)"

git -C "$REPO_ROOT" bundle create "$BUNDLE_PATH" main >/dev/null

bash "$REPO_ROOT/scripts/server/receive-github-bundle.sh" \
  --dry-run \
  --bundle "$BUNDLE_PATH" \
  --sha "$SHA" \
  --release-root "$RELEASE_ROOT" \
  --origin-path "$ORIGIN_PATH" \
  --bootstrap-path "$BOOTSTRAP_PATH" > "$OUTPUT_PATH"

grep -F "origin_path=$ORIGIN_PATH" "$OUTPUT_PATH" >/dev/null
grep -F "bootstrap_path=$BOOTSTRAP_PATH" "$OUTPUT_PATH" >/dev/null
grep -F "bootstrap_head=$SHA" "$OUTPUT_PATH" >/dev/null
grep -F "deploy_sha=$SHA" "$OUTPUT_PATH" >/dev/null
grep -F "server_shared_root=$RELEASE_ROOT/shared" "$OUTPUT_PATH" >/dev/null

echo "receive-github-bundle smoke test passed"
