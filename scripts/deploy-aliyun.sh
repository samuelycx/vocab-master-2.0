#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  bash scripts/deploy-aliyun.sh [--dry-run] [--sha <commit-ish>] [--release-root <path>]

Purpose:
  Deploy a Git SHA into the repo/releases/shared/current layout, then build and
  restart PM2 from current/ without storing runtime state inside the release.
EOF
}

DRY_RUN=false
DEPLOY_SHA="${DEPLOY_SHA:-}"
RELEASE_ROOT="${SERVER_RELEASE_ROOT:-/var/www/vocab-master}"

while (($# > 0)); do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --sha)
      DEPLOY_SHA="${2:-}"
      shift 2
      ;;
    --release-root)
      RELEASE_ROOT="${2:-}"
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

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEFAULT_SHARED_ROOT="$RELEASE_ROOT/shared"
SERVER_SHARED_ROOT="${SERVER_SHARED_ROOT:-$DEFAULT_SHARED_ROOT}"
SERVER_ENV_FILE="${SERVER_ENV_FILE:-$SERVER_SHARED_ROOT/env/server.env}"
SERVER_SHARED_UPLOADS_ROOT="${SERVER_SHARED_UPLOADS_ROOT:-$SERVER_SHARED_ROOT/uploads}"
SERVER_SHARED_LOGS_ROOT="${SERVER_SHARED_LOGS_ROOT:-$SERVER_SHARED_ROOT/logs}"
DATABASE_URL="${DATABASE_URL:-file:$SERVER_SHARED_ROOT/prisma/dev.db}"

if [ -z "$DEPLOY_SHA" ]; then
  if git -C "$REPO_ROOT" rev-parse HEAD >/dev/null 2>&1; then
    DEPLOY_SHA="$(git -C "$REPO_ROOT" rev-parse HEAD)"
  else
    echo "error=missing_sha_and_git_context" >&2
    exit 1
  fi
fi

CURRENT_PATH="$RELEASE_ROOT/current"
CURRENT_WEB_PATH="$CURRENT_PATH/web"
CURRENT_SERVER_PATH="$CURRENT_PATH/server"

print_plan() {
  echo "mode=$([ "$DRY_RUN" = true ] && echo dry-run || echo apply)"
  echo "release_root=$RELEASE_ROOT"
  echo "deploy_sha=$DEPLOY_SHA"
  echo "current_path=$CURRENT_PATH"
  echo "server_shared_root=$SERVER_SHARED_ROOT"
  echo "server_env_file=$SERVER_ENV_FILE"
  echo "server_shared_uploads_root=$SERVER_SHARED_UPLOADS_ROOT"
  echo "server_shared_logs_root=$SERVER_SHARED_LOGS_ROOT"
  echo "database_url=$DATABASE_URL"
}

print_plan

if [ "$DRY_RUN" = true ]; then
  exit 0
fi

echo "== bootstrap release layout =="
bash "$REPO_ROOT/scripts/server/bootstrap-git-release-layout.sh" "$RELEASE_ROOT"

echo "== deploy release from git =="
bash "$REPO_ROOT/scripts/server/deploy-from-git.sh" "$RELEASE_ROOT" --sha "$DEPLOY_SHA"

echo "== prepare shared runtime directories =="
mkdir -p \
  "$SERVER_SHARED_ROOT/env" \
  "$SERVER_SHARED_ROOT/prisma" \
  "$SERVER_SHARED_UPLOADS_ROOT" \
  "$SERVER_SHARED_LOGS_ROOT"

if [ ! -f "$SERVER_ENV_FILE" ]; then
  cat > "$SERVER_ENV_FILE" <<EOF
DATABASE_URL="$DATABASE_URL"
SERVER_SHARED_ROOT="$SERVER_SHARED_ROOT"
SERVER_SHARED_UPLOADS_ROOT="$SERVER_SHARED_UPLOADS_ROOT"
SERVER_SHARED_LOGS_ROOT="$SERVER_SHARED_LOGS_ROOT"
EOF
fi

echo "== load shared runtime env =="
set -a
source "$SERVER_ENV_FILE"
set +a

echo "== build web =="
(
  cd "$CURRENT_WEB_PATH"
  npm install
  npm run build
)

echo "== build server =="
(
  cd "$CURRENT_SERVER_PATH"
  npm install
  npx prisma generate
  npx prisma migrate deploy
  npx prisma db seed
  rm -rf dist
  npm run build
)

echo "== restart pm2 =="
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

pm2 delete "vocab-master-web" 2>/dev/null || true
SERVER_SHARED_ROOT="$SERVER_SHARED_ROOT" \
SERVER_ENV_FILE="$SERVER_ENV_FILE" \
SERVER_SHARED_UPLOADS_ROOT="$SERVER_SHARED_UPLOADS_ROOT" \
SERVER_SHARED_LOGS_ROOT="$SERVER_SHARED_LOGS_ROOT" \
DATABASE_URL="$DATABASE_URL" \
pm2 start "$CURRENT_SERVER_PATH/ecosystem.config.cjs" --only "vocab-master-web" --update-env

echo "--------------------------------------------------"
echo "deploy_complete=ok"
echo "current_path=$CURRENT_PATH"
echo "revision=$(cat "$CURRENT_PATH/REVISION")"
echo "shared_runtime_root=$SERVER_SHARED_ROOT"
echo "--------------------------------------------------"
