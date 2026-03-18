# TTS credentials runbook

## Purpose

This runbook documents how to govern TTS credentials after moving repository scripts to environment-based configuration.
It separates repository-safe preparation work from the real cloud changes that must be executed manually.

## Scope for this round

Included in this round:

- repository-tracked helper scripts read credentials from environment variables or CLI flags
- documentation for dry-run, dependency, and proxy handling
- clear manual checklist for later credential rotation

Not included in this round:

- actual cloud key creation
- actual cloud key revocation
- actual cloud IAM role changes

Those production or cloud-console steps are a separate manual stage and should only happen after the repository changes are reviewed and accepted.

## Repository configuration rules

- Never commit JSON key files to the repository
- Never hardcode a local absolute credential path in tracked scripts
- Never hardcode a proxy address in tracked scripts
- Prefer environment variables for runtime configuration
- Use CLI flags only as explicit per-run overrides

## Recommended runtime variables

- `GOOGLE_APPLICATION_CREDENTIALS`: service-account JSON file path
- `HTTP_PROXY` / `HTTPS_PROXY`: optional proxy configuration
- `TTS_VOICE_NAME`: optional default voice override
- `TTS_LANGUAGE_CODE`: optional default language code override

## Manual rotation checklist

1. Confirm repository changes are merged and current scripts are using env-based configuration only.
2. Identify the active service account and the workloads or operators that still depend on it.
3. Create a new credential in the cloud console or cloud IAM workflow.
4. Store the new JSON key in the target secret manager, deployment environment, or approved local secret store.
5. Update the runtime environment so `GOOGLE_APPLICATION_CREDENTIALS` points to the new key location.
6. Run a dry-run command first, then run a real generation smoke test in the approved runtime.
7. Verify generated output and audit logs.
8. Revoke the old key only after the new key has been validated end to end.

## Suggested smoke-test commands

Dry-run:

```bash
python3 scripts/tts/generate_audio.py ./data/words.csv ./artifacts/audio --dry-run
```

Real generation after manual key rotation:

```bash
python3 scripts/tts/generate_audio.py ./data/words.csv ./artifacts/audio
```

Missing-file audit:

```bash
python3 scripts/tts/check_missing.py ./data/words.csv ./artifacts/audio
```

## Failure handling

- If dry-run fails, fix the repository script usage or input file format before touching cloud credentials.
- If real generation fails with auth or permission errors, stop and verify the new key's scope before revoking the old key.
- If generation works only with a hardcoded local path, treat that as a rollback signal and fix the runtime configuration instead of editing the tracked scripts.

## Ownership handoff

- Engineering owns the repository scripts and documentation.
- The final credential rotation should be executed by the person or environment owner with cloud access.
- Record the rotation timestamp, operator, and validation result outside the repository in the usual ops log.
