# Tasks 2-5 Parallel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver follow-up tasks 2-5 as four parallel workstreams, keeping all risky online/cloud actions deferred until local code, scripts, tests, and runbooks are ready.

**Architecture:** Split the work by write scope: worddata repair toolkit, leaderboard cleanup toolkit, TTS tooling/governance, and profile hardening. Each stream owns a disjoint file set, produces its own verification evidence, and avoids direct online side effects during parallel execution.

**Tech Stack:** NestJS, Prisma, SQLite, Vue 3, Vite, Jest, Vitest, TypeScript, Python 3 scripts

---

### Task 1: Worddata Repair Toolkit (Follow-up Task 2)

**Files:**
- Create: `server/src/worddata/encoding-rules.ts`
- Create: `server/src/worddata/encoding-audit.ts`
- Create: `server/src/worddata/encoding-repair.ts`
- Create: `server/src/worddata/encoding-audit.spec.ts`
- Create: `server/scripts/audit-worddata.ts`
- Create: `server/scripts/repair-worddata.ts`
- Create: `docs/release/WORDDATA_ENCODING_AUDIT.md`
- Create: `docs/release/WORDDATA_REPAIR_RUNBOOK.md`

**Ownership:**
- This worker owns only the files above.
- Do not modify auth/profile, TTS, leaderboard cleanup, or unrelated Prisma logic.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing test**
- Add fixture-driven tests in `server/src/worddata/encoding-audit.spec.ts` for:
  - replacement character detection
  - invalid JSON detection for `meanings` / `examples`
  - mojibake fragment detection (e.g. `Ã©`, `â€™`)
  - safe repair transformation for known bad fragments

**Step 2: Run test to verify it fails**
Run: `cd server && npm test -- encoding-audit.spec.ts`
Expected: FAIL because `server/src/worddata/encoding-audit.ts` and repair helpers do not exist yet.

**Step 3: Write minimal implementation**
- Implement reusable rule helpers in `server/src/worddata/encoding-rules.ts`
- Implement row scanning in `server/src/worddata/encoding-audit.ts`
- Implement conservative repair helpers in `server/src/worddata/encoding-repair.ts`

**Step 4: Run test to verify it passes**
Run: `cd server && npm test -- encoding-audit.spec.ts`
Expected: PASS

**Step 5: Add CLI scripts**
- Add `server/scripts/audit-worddata.ts` to read a SQLite DB, scan `Word`, and emit markdown/json output
- Add `server/scripts/repair-worddata.ts` to support dry-run and apply modes against a local DB copy
- Keep write mode opt-in and explicit

**Step 6: Verify script ergonomics**
Run: `cd server && npx ts-node scripts/audit-worddata.ts --help`
Expected: prints usage or exits cleanly without mutating DB

**Step 7: Write docs**
- `docs/release/WORDDATA_ENCODING_AUDIT.md`: report format and current findings template
- `docs/release/WORDDATA_REPAIR_RUNBOOK.md`: backup, dry-run, apply, verify steps

**Step 8: Commit**
```bash
git add server/src/worddata server/scripts/audit-worddata.ts server/scripts/repair-worddata.ts docs/release/WORDDATA_ENCODING_AUDIT.md docs/release/WORDDATA_REPAIR_RUNBOOK.md
git commit -m "feat: add worddata repair toolkit"
```

### Task 2: Leaderboard Cleanup Toolkit (Follow-up Task 3)

**Files:**
- Create: `server/src/progress/leaderboard-cleanup.ts`
- Create: `server/src/progress/leaderboard-cleanup.spec.ts`
- Create: `server/scripts/export-leaderboard-cleanup.ts`
- Create: `server/scripts/apply-leaderboard-cleanup.ts`
- Create: `docs/release/LEADERBOARD_CLEANUP_RUNBOOK.md`

**Ownership:**
- This worker owns only the files above.
- Do not modify auth/profile, TTS, or worddata files.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing test**
- Add tests in `server/src/progress/leaderboard-cleanup.spec.ts` for:
  - candidate detection from user rows
  - manifest validation
  - dry-run cleanup summary
  - cleanup transaction plan generation

**Step 2: Run test to verify it fails**
Run: `cd server && npm test -- leaderboard-cleanup.spec.ts`
Expected: FAIL because cleanup helpers do not exist yet.

**Step 3: Write minimal implementation**
- Implement candidate heuristics and manifest parsing in `server/src/progress/leaderboard-cleanup.ts`
- Keep deletion logic separate from detection logic
- Ensure cleanup requires an approved manifest, not heuristic-only direct deletion

**Step 4: Run test to verify it passes**
Run: `cd server && npm test -- leaderboard-cleanup.spec.ts`
Expected: PASS

**Step 5: Add scripts**
- `server/scripts/export-leaderboard-cleanup.ts` exports ranked candidates + metadata + backup references
- `server/scripts/apply-leaderboard-cleanup.ts` supports `--dry-run` and `--manifest <file>`
- Default mode must be non-destructive

**Step 6: Verify script ergonomics**
Run: `cd server && npx ts-node scripts/apply-leaderboard-cleanup.ts --help`
Expected: clean usage output, no data mutation

**Step 7: Write runbook**
- Define candidate review workflow
- Define backup-before-delete steps
- Define rollback process
- Explicitly mark real cleanup as a final manual stage

**Step 8: Commit**
```bash
git add server/src/progress/leaderboard-cleanup.* server/scripts/export-leaderboard-cleanup.ts server/scripts/apply-leaderboard-cleanup.ts docs/release/LEADERBOARD_CLEANUP_RUNBOOK.md
git commit -m "feat: add leaderboard cleanup toolkit"
```

### Task 3: TTS Tooling and Governance (Follow-up Task 4)

**Files:**
- Create: `scripts/tts/generate_audio.py`
- Create: `scripts/tts/check_missing.py`
- Create: `scripts/tts/README.md`
- Create: `docs/release/2026-03-18-tts-options.md`
- Create: `docs/release/TTS_CREDENTIALS_RUNBOOK.md`

**Ownership:**
- This worker owns only the files above.
- Do not modify ignored `tts/` local workspace files in place.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing validation target**
- Create scripts that can be syntax-checked without real cloud credentials
- Replace hardcoded proxy and hardcoded credential path assumptions with CLI args / environment variables documented in README

**Step 2: Verify current absence/failure**
Run: `python3 -m py_compile scripts/tts/generate_audio.py`
Expected: FAIL before files exist

**Step 3: Write minimal implementation**
- `scripts/tts/generate_audio.py`:
  - accepts word list path, output dir, optional dry-run
  - reads credentials from env, never hardcodes a local JSON path
  - keeps cloud SDK import/use isolated so config errors are explicit
- `scripts/tts/check_missing.py`:
  - uses stdlib CSV parsing where possible
  - reports missing audio based on an input vocabulary file and output dir
- `scripts/tts/README.md`:
  - documents env vars, proxies, input/output format, dry-run usage
- `docs/release/2026-03-18-tts-options.md`:
  - compares 2-3 TTS approaches with recommendation
- `docs/release/TTS_CREDENTIALS_RUNBOOK.md`:
  - documents how to rotate keys and move to env-based configuration

**Step 4: Verify syntax**
Run: `python3 -m py_compile scripts/tts/generate_audio.py scripts/tts/check_missing.py`
Expected: PASS

**Step 5: Verify docs completeness**
- Ensure README references env-based credentials only
- Ensure runbook explicitly says actual key rotation is a separate final step

**Step 6: Commit**
```bash
git add scripts/tts docs/release/2026-03-18-tts-options.md docs/release/TTS_CREDENTIALS_RUNBOOK.md
git commit -m "feat: add tts tooling and governance docs"
```

### Task 4: Profile Hardening and Atomic Save (Follow-up Task 5)

**Files:**
- Modify: `server/src/auth/auth.controller.ts`
- Modify: `server/src/auth/auth.service.ts`
- Modify: `server/src/auth/avatar-upload.ts`
- Modify: `server/src/auth/dto/auth.dto.ts`
- Modify: `server/src/auth/auth.controller.spec.ts`
- Modify: `server/src/web-api.contract.spec.ts`
- Modify: `web/src/api.js`
- Modify: `web/src/components/ProfileSetup.vue`
- Modify: `web/src/components/ProfileSetup.spec.js`

**Ownership:**
- This worker owns only the files above.
- Do not modify worddata, leaderboard cleanup, or TTS files.
- You are not alone in the codebase; do not revert others' edits.

**Step 1: Write the failing backend tests**
- Add backend tests for:
  - `PATCH /auth/profile` accepts nickname-only updates
  - invalid avatar MIME/extension is rejected
  - DB failure after file save triggers file cleanup
  - successful avatar replacement removes the old local avatar file

**Step 2: Run backend test to verify it fails**
Run: `cd server && npm test -- auth.controller.spec.ts web-api.contract.spec.ts`
Expected: FAIL because current API still uses split profile/avatar flow.

**Step 3: Write minimal backend implementation**
- Upgrade `PATCH /auth/profile` to support multipart requests with optional avatar
- Keep nickname validation in service
- Map MIME type to a controlled file extension
- On DB failure, remove the just-written file
- On successful replacement, delete the old local uploaded avatar if applicable

**Step 4: Run backend tests to verify it passes**
Run: `cd server && npm test -- auth.controller.spec.ts web-api.contract.spec.ts`
Expected: PASS

**Step 5: Write the failing frontend tests**
- Update `web/src/components/ProfileSetup.spec.js` so save flow expects a single API call
- Add cases for success, backend validation failure, and no partial-success local state update

**Step 6: Run frontend test to verify it fails**
Run: `cd web && npm test -- ProfileSetup.spec.js api.spec.js`
Expected: FAIL because frontend still calls `uploadAvatar()` and `updateProfile()` separately.

**Step 7: Write minimal frontend implementation**
- Collapse API usage into a single `API.updateProfile(...)` multipart submission
- Remove separate `API.uploadAvatar(...)` dependency from the view flow
- Keep preview UX intact but update state only on full success

**Step 8: Run frontend tests to verify it passes**
Run: `cd web && npm test -- ProfileSetup.spec.js api.spec.js`
Expected: PASS

**Step 9: Run broader verification**
Run: `cd server && npm test -- auth.controller.spec.ts web-api.contract.spec.ts`
Run: `cd web && npm test -- ProfileSetup.spec.js`
Expected: PASS

**Step 10: Commit**
```bash
git add server/src/auth server/src/web-api.contract.spec.ts web/src/api.js web/src/components/ProfileSetup.vue web/src/components/ProfileSetup.spec.js
git commit -m "fix: harden profile updates and avatar uploads"
```

### Final Integration Task

**Files:**
- Modify only if integration issues require it

**Step 1: Rebase/merge worker outputs carefully**
- Do not overwrite other workers' changes
- Resolve only true conflicts

**Step 2: Run unified verification**
Run: `cd server && npm test`
Run: `cd server && npm run build`
Run: `cd web && npm test`
Run: `cd web && npm run build`
Expected: all PASS

**Step 3: Handle deferred high-risk operations manually**
- Review leaderboard cleanup manifest before any real deletion
- Review TTS credentials runbook before any real rotation

**Step 4: Final commit if needed**
```bash
git add -A
git commit -m "chore: integrate follow-up tasks 2-5" || true
```
