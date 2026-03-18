# Server Git Migration Checklist

## Before migration

- Confirm `origin/main` contains the intended release commit.
- Confirm current server directory has been backed up outside the active release path.
- Confirm database, uploads, and logs are identified as shared runtime state.
- Confirm PM2 process name and health-check endpoint are known.

## First migration checks

- `repo/`, `releases/`, `shared/`, `backups/`, `current/` layout exists.
- A target SHA can be resolved from Git and expanded into `releases/<sha>/`.
- `current` points to the intended release path.
- `REVISION` exists under the release path.

## Rollback readiness

- Previous server directory backup path is recorded.
- Previous release SHA is recorded before switching `current`.
- `verify-current-release.sh` can show the active release target.
