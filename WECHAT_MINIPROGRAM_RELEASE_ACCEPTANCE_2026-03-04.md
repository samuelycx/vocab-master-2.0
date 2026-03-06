# WeChat Mini Program Release Acceptance Report

- Project: `vocab-master-2.0 / client-uni`
- Report time: `2026-03-04 18:37:07 CST`
- Scope: mini program code + cloud functions static verification

## 1) Automated Verification Results

### 1.1 Syntax check
- PASS: `node --check client-uni/src/api.js`
- PASS: `node --check client-uni/src/socket.js`
- PASS: `node --check client-uni/src/static/cloudfunctions/auth/index.js`
- PASS: `node --check client-uni/src/static/cloudfunctions/words/index.js`
- PASS: `node --check client-uni/src/static/cloudfunctions/progress/index.js`
- PASS: `node --check client-uni/src/static/cloudfunctions/admin/index.js`

### 1.2 Error-code normalization
- PASS: cloud function error codes are present for key cases:
  - `MISSING_OPENID` (auth/progress)
  - `UNKNOWN_TYPE` (auth/words/admin/progress)
  - `UNAUTHORIZED` (admin/progress)
  - `INVALID_WORD_ID` (progress)
  - `USER_BANNED`, `DEVICE_MISMATCH` (auth)
- PASS: frontend `callCloud` normalizes response to `{ success, code, msg, data }`.

### 1.3 Security and data hardening (code-level)
- PASS: banned user denied in `auth.login`.
- PASS: banned user denied in `progress.main`.
- PASS: leaderboard excludes banned users.
- PASS: social feed excludes banned users and deduplicates same user+achievement rows.
- PASS: words search has regex escaping and result limit.
- PASS: admin module toggle uses whitelist key check.
- PASS: progress achievements write path includes pre-check (`openid + achievementId`) to reduce duplicates.

### 1.4 PK stability protections (code-level)
- PASS: stale room cleanup exists (`waiting` and `ended` cleanup).
- PASS: queue entry performs pre-cleanup.
- PASS: room watcher handles missing/invalidated room.
- PASS: ID fallback uses `id || _id || openid` in critical PK/progress paths.

## 2) Manual Verification Required (Cloud Console / Runtime)

These are not fully verifiable from local static code and must be confirmed before production release:

- PENDING: Cloud functions deployed to production env:
  - `auth`, `words`, `progress`, `admin`, `initDatabase`
- PENDING: Database indexes configured:
  - `progress(openid, wordId)`
  - `progress(openid, status, lastReviewedAt)`
  - `user_achievements(openid, achievementId)`
  - `user_achievements(unlockedAt)`
  - `pk_rooms(status, createdAt)`
  - `users(openid)`, `users(xp)`
- PENDING: WeChat cloud quotas/alarms:
  - function invocation quota
  - DB storage/query quota
  - error-rate monitoring alarm
- PENDING: real-device smoke test:
  - login/new user
  - learn/review/mistake session
  - online PK full lifecycle
  - social leaderboard/feed display

## 3) Final Release Decision

- Decision: **Conditional GO**
- Rationale:
  - Code-level release checks are passed.
  - Remaining risks are deployment/runtime configuration items.
- Release gate:
  - Complete all PENDING manual checks in section 2, then release is approved.
