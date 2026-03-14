#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "== Web Preflight =="
echo "Root: $ROOT_DIR"

echo
echo "== Web tests =="
cd "$ROOT_DIR/web"
npm test -- \
  src/App.spec.js \
  src/auth-session.spec.js \
  src/components/AuthView.spec.js \
  src/components/Dashboard.spec.js \
  src/components/GameArena.spec.js \
  src/components/Settings.spec.js \
  src/components/VocabularyList.spec.js \
  src/components/SocialView.spec.js \
  src/api.spec.js \
  src/engine-web-api.spec.js \
  src/socket.spec.js

echo
echo "== Web build =="
npm run build

echo
echo "== Server tests =="
cd "$ROOT_DIR/server"
env PATH=/usr/local/bin:$PATH npm test -- --runInBand \
  src/web-api.contract.spec.ts \
  src/progress/progress.service.spec.ts \
  src/progress/progress.controller.spec.ts

echo
echo "== Server build =="
env PATH=/usr/local/bin:$PATH npm run build

echo
echo "== Preflight complete =="
