# Server Git Release Runbook

## Goal

Deploy server releases from a Git SHA instead of syncing a local working directory to the server.

## Directory model

```text
/var/www/vocab-master/
  repo/
  releases/
  current -> releases/<sha>/
  shared/
  backups/
```

Shared runtime defaults:

- `SERVER_SHARED_ROOT=/var/www/vocab-master/shared`
- `SERVER_ENV_FILE=/var/www/vocab-master/shared/env/server.env`
- `DATABASE_URL="file:/var/www/vocab-master/shared/prisma/dev.db"`
- uploads live in `/var/www/vocab-master/shared/uploads`
- logs live in `/var/www/vocab-master/shared/logs`

## Dry-run checks

Bootstrap layout:

```bash
bash scripts/server/bootstrap-git-release-layout.sh --dry-run /tmp/vocab-master-release-root
```

Deploy from Git:

```bash
bash scripts/server/deploy-from-git.sh --dry-run /tmp/vocab-master-release-root --sha HEAD
```

Git-driven deploy entrypoint:

```bash
bash scripts/deploy-aliyun.sh --dry-run --sha HEAD --release-root /tmp/vocab-master-release-root
```

## Expected dry-run output

- `release_root`
- `repo_path`
- `releases_path`
- `shared_path`
- `current_path`
- `resolved_sha`
- `shared_env_path`
- `shared_prisma_path`
- `shared_uploads_path`
- `shared_logs_path`

## Planned release flow

1. Bootstrap release layout on the server.
2. Clone/fetch Git repository into `repo/`.
3. Expand target SHA into `releases/<sha>/`.
4. Link `current/` to the new release.
5. Load shared runtime config from `shared/env/server.env`.
6. Build web/server from `current/` and restart PM2 from `current/server/ecosystem.config.cjs`.
7. Write `current/release-manifest.json` and `shared/release-history/<timestamp>-<sha>.json`.
8. Keep SQLite, uploads and logs under `shared/prisma`, `shared/uploads`, `shared/logs`.

## Release evidence

After a successful deploy, verify:

- `current/REVISION`
- `current/release-manifest.json`
- `shared/release-history/<timestamp>-<sha>.json`

Schema reference:

- `docs/release/SERVER_RELEASE_MANIFEST_SCHEMA.md`

## Rollback by SHA

1. Run `bash scripts/server/verify-current-release.sh /var/www/vocab-master`
2. Pick a previous SHA from `shared/release-history/`
3. Redeploy it with `bash scripts/server/deploy-from-git.sh /var/www/vocab-master --sha <sha>`
4. Re-run `verify-current-release.sh` to confirm `manifest_commit`, `manifest_releasePath`, `manifest_currentPath`
