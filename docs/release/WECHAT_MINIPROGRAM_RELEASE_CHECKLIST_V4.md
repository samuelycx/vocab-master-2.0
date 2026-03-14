# WeChat Mini Program Release Checklist (V4)

## 1) Cloud Function Deploy
- Deploy functions: `auth`, `words`, `progress`, `admin`, `initDatabase`.
- Confirm each function version is latest in WeChat Cloud Console.
- Confirm environment is production (not test env).

## 2) Database Indexes (Recommended)
- `progress`: composite index `openid + wordId` (query/update hot path).
- `progress`: composite index `openid + status + lastReviewedAt`.
- `user_achievements`: composite index `openid + achievementId` (de-dup path).
- `user_achievements`: composite index `unlockedAt` (feed sort path).
- `pk_rooms`: composite index `status + createdAt` (match + cleanup path).
- `users`: index `openid` (login/auth path), index `xp` (leaderboard sort).

## 3) Security/Permission Checks
- Verify `auth` denies `BANNED` users.
- Verify `progress` denies `BANNED` users.
- Verify `admin` only allows `ADMIN` role.
- Verify `admin.toggleModule` only allows white-listed keys.
- Verify `words.searchWords` has regex escaping + limit.

## 4) Key User Flows Regression
- Login:
  - New account can create profile.
  - Existing account can login.
  - Banned account receives deny message.
- Learn Session:
  - Enter session, answer correct/wrong, session completes.
  - XP/coins update and no crash for words missing legacy fields.
- Review/Mistake:
  - Review list loads.
  - Mistake list loads and sorted by mistake count.
- PK Online:
  - Queue -> matched -> game starts.
  - Score updates to both sides.
  - Quit mid-game sets room to `ended`.
  - Stale room cleanup works (old waiting/ended rooms removed).
- Social:
  - Leaderboard excludes banned users.
  - Feed excludes banned users.
  - Feed de-duplicates same user/achievement spam rows.

## 5) Error Handling Verification
- Unknown cloud function type returns `code=UNKNOWN_TYPE`.
- Missing openid returns `code=MISSING_OPENID`.
- Invalid progress wordId returns `code=INVALID_WORD_ID`.
- Frontend `callCloud` always receives normalized `{ success, code, msg }`.

## 6) Pre-Release Operational Checks
- Ensure mini program domain whitelist includes all required endpoints.
- Ensure cloud DB quota and function invocation quota are sufficient.
- Ensure monitoring/alarm for cloud function error rate is enabled.
- Backup key collections before major data migration:
  - `words`, `users`, `progress`, `user_achievements`, `pk_rooms`.
