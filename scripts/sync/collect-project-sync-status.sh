#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel)"

cd "$ROOT_DIR"

LOCAL_HEAD="$(git rev-parse HEAD)"
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
ORIGIN_MAIN="$(git rev-parse origin/main 2>/dev/null || echo missing)"

if git diff --quiet && git diff --cached --quiet; then
  WORKING_TREE_CLEAN=true
else
  WORKING_TREE_CLEAN=false
fi

echo "project_root=$ROOT_DIR"
echo "current_branch=$CURRENT_BRANCH"
echo "local_head=$LOCAL_HEAD"
echo "origin_main=$ORIGIN_MAIN"
echo "working_tree_clean=$WORKING_TREE_CLEAN"
echo "source_of_truth=origin/main"
