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

## Dry-run checks

Bootstrap layout:

```bash
bash scripts/server/bootstrap-git-release-layout.sh --dry-run /tmp/vocab-master-release-root
```

Deploy from Git:

```bash
bash scripts/server/deploy-from-git.sh --dry-run /tmp/vocab-master-release-root --sha HEAD
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
5. In later tasks, connect shared runtime state and PM2 restart.
