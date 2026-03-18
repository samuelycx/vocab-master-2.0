#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/server/receive-github-bundle.sh [--dry-run] --bundle <bundle-path> --sha <commit> --release-root <path> [--origin-path <path>] [--bootstrap-path <path>] [--branch <name>]

Purpose:
  Update a server-local bare Git origin from a GitHub-produced bundle, refresh the
  bootstrap checkout, and then deploy the requested SHA into the release layout.
EOF
}

DRY_RUN=false
BUNDLE_PATH=""
TARGET_SHA=""
RELEASE_ROOT=""
ORIGIN_PATH="/root/vocab-master-origin-main.git"
BOOTSTRAP_PATH="/root/vocab-master-bootstrap-main"
BRANCH_NAME="main"

while (($# > 0)); do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --bundle)
      BUNDLE_PATH="${2:-}"
      shift 2
      ;;
    --sha)
      TARGET_SHA="${2:-}"
      shift 2
      ;;
    --release-root)
      RELEASE_ROOT="${2:-}"
      shift 2
      ;;
    --origin-path)
      ORIGIN_PATH="${2:-}"
      shift 2
      ;;
    --bootstrap-path)
      BOOTSTRAP_PATH="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH_NAME="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 1
      ;;
  esac
done

if [ -z "$BUNDLE_PATH" ] || [ -z "$TARGET_SHA" ] || [ -z "$RELEASE_ROOT" ]; then
  usage >&2
  exit 1
fi

if [ ! -f "$BUNDLE_PATH" ]; then
  echo "error=missing_bundle_path" >&2
  exit 1
fi

mkdir -p "$(dirname "$ORIGIN_PATH")" "$(dirname "$BOOTSTRAP_PATH")"

if [ -d "$ORIGIN_PATH" ]; then
  git -C "$ORIGIN_PATH" fetch "$BUNDLE_PATH" "refs/heads/$BRANCH_NAME:refs/heads/$BRANCH_NAME"
else
  git clone --bare "$BUNDLE_PATH" "$ORIGIN_PATH" >/dev/null 2>&1
fi

git -C "$ORIGIN_PATH" symbolic-ref HEAD "refs/heads/$BRANCH_NAME"
git -C "$ORIGIN_PATH" rev-parse "$TARGET_SHA^{commit}" >/dev/null

if [ -d "$BOOTSTRAP_PATH/.git" ]; then
  git -C "$BOOTSTRAP_PATH" remote set-url origin "$ORIGIN_PATH"
  git -C "$BOOTSTRAP_PATH" fetch origin
  git -C "$BOOTSTRAP_PATH" checkout -B "$BRANCH_NAME" "origin/$BRANCH_NAME" >/dev/null
else
  git clone -b "$BRANCH_NAME" "$ORIGIN_PATH" "$BOOTSTRAP_PATH" >/dev/null 2>&1
fi

BOOTSTRAP_HEAD="$(git -C "$BOOTSTRAP_PATH" rev-parse "$TARGET_SHA^{commit}")"

echo "bundle_path=$BUNDLE_PATH"
echo "origin_path=$ORIGIN_PATH"
echo "bootstrap_path=$BOOTSTRAP_PATH"
echo "bootstrap_head=$BOOTSTRAP_HEAD"

DEPLOY_ARGS=(--sha "$TARGET_SHA" --release-root "$RELEASE_ROOT")
if [ "$DRY_RUN" = true ]; then
  DEPLOY_ARGS=(--dry-run "${DEPLOY_ARGS[@]}")
fi

SERVER_RELEASE_ROOT="$RELEASE_ROOT" \
  bash "$BOOTSTRAP_PATH/scripts/deploy-aliyun.sh" "${DEPLOY_ARGS[@]}"
