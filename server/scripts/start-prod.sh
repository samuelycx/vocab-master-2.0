#!/usr/bin/env bash
set -euo pipefail

SERVER_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$SERVER_DIR"

if [ ! -f ".env" ]; then
  echo "Missing server/.env"
  echo "You can start from server/.env.example"
  exit 1
fi

if [ ! -d "../client/dist" ]; then
  echo "Missing client/dist"
  echo "Run: cd ../client && npm run build"
  exit 1
fi

echo "== Prisma migrate deploy =="
npx prisma migrate deploy

echo
echo "== Build server =="
npm run build

echo
echo "== Start server =="
NODE_ENV=production node dist/main

