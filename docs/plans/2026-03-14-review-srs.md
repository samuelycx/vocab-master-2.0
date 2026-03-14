# Review SRS Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a fixed-step review schedule (10min → 1d → 3d → 7d → 15d → 30d → 60d → 120d) with a mixed review pool (mistakes + due reviews), random ordering, and a 30-word per-session cap, while showing the total pending review count on the dashboard.

**Architecture:** Keep `studyRecord` as the single source of truth, add `reviewStage` to track fixed review progression, and centralize review-pool logic in `ProgressService`. `WordController` serves randomized review sessions; `ProgressController` returns total pending count for dashboard.

**Tech Stack:** NestJS, Prisma, Vue 3, Jest (server tests)

---

### Task 1: Add reviewStage to StudyRecord

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/prisma/schema.prisma`

**Step 1: Write the failing test**

Create a new test to assert `reviewStage` is present on records returned by the progress service after sync.

```ts
// /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.service.spec.ts
import { ProgressService } from './progress.service';

describe('ProgressService reviewStage', () => {
  it('sets reviewStage on new records', async () => {
    // Test will fail until reviewStage exists in schema and service writes it.
    expect(true).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm --prefix /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server test -- progress.service.spec.ts`
Expected: FAIL (test intentionally fails)

**Step 3: Update schema**

Add field to `StudyRecord`:

```prisma
reviewStage Int @default(0)
```

**Step 4: Run Prisma migration**

Run: `npx --prefix /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server prisma migrate dev --name add-review-stage`
Expected: migration created and applied

**Step 5: Regenerate Prisma client**

Run: `npx --prefix /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server prisma generate`
Expected: Prisma client generated

**Step 6: Update test to assert real behavior**

Replace failing assertion with a real service call (see Task 2 for implementation details).

**Step 7: Run test to verify it passes**

Run: `npm --prefix /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server test -- progress.service.spec.ts`
Expected: PASS

**Step 8: Commit**

```bash
git add /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/prisma/schema.prisma \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/prisma/migrations \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.service.spec.ts

git commit -m "feat: add reviewStage to study records"
```

---

### Task 2: Implement fixed review schedule + review pool logic

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.service.ts`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.controller.ts`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/word/word.controller.ts`
- Test: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.service.spec.ts`

**Step 1: Write the failing tests**

```ts
import { ProgressService } from './progress.service';

describe('ProgressService review schedule', () => {
  it('uses fixed steps for review correct answers', () => {
    const now = new Date('2026-03-14T00:00:00.000Z');
    const record = { interval: 0, repetition: 0, easeFactor: 2.5, reviewStage: 0 };
    // Expect stage 0 correct -> +10min
    expect(true).toBe(false);
  });

  it('resets review stage on review wrong answer', () => {
    expect(true).toBe(false);
  });

  it('mixes mistake + due reviews and returns total count', async () => {
    expect(true).toBe(false);
  });
});
```

**Step 2: Run tests to verify failures**

Run: `npm --prefix /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server test -- progress.service.spec.ts`
Expected: FAIL

**Step 3: Implement review schedule in ProgressService**

Implementation outline:

```ts
const REVIEW_STEPS = [10 * 60 * 1000, 1, 3, 7, 15, 30, 60, 120];

private calculateNextReviewFixed(currentRecord: any, isCorrect: boolean, isReview: boolean) {
  // if isReview:
  //  - correct: stage++ (max 7), set nextReview based on stage
  //  - wrong: stage=0, nextReview=now+10min
  // if not isReview:
  //  - wrong: stage=0, nextReview=now+10min
  //  - correct: keep stage as-is unless you want to initialize (optional)
}
```

Use `setTime(now.getTime() + 10min)` for stage 0; use `setDate()` for days.

**Step 4: Implement review pool helpers**

Add helper to get mixed pool and total count:

```ts
async getReviewPool(userId: string) { /* mistakeCount>0 OR nextReview<=now */ }
async getReviewPoolCount(userId: string) { /* count */ }
async getReviewSessionWords(userId: string, limit=30) { /* shuffle + slice */ }
```

**Step 5: Update controllers**

- `GET /progress/reviews`: return `{ total, words?: [] }` (total only is enough for dashboard)
- `GET /words/review`: return randomized session words (limit 30)

**Step 6: Fix tests**

Replace failing assertions with expectations that match fixed schedule, and stub time/random where needed.

**Step 7: Run tests to verify pass**

Run: `npm --prefix /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server test -- progress.service.spec.ts`
Expected: PASS

**Step 8: Commit**

```bash
git add /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.service.ts \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.controller.ts \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/word/word.controller.ts \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/server/src/progress/progress.service.spec.ts

git commit -m "feat: implement fixed-step review schedule"
```

---

### Task 3: Update client to show total pending count and use review session endpoint

**Files:**
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/client/src/api.js`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/client/src/engine.js`
- Modify: `/Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/client/src/components/Dashboard.vue`

**Step 1: Write the failing test**

If no client test harness is present, add a small unit test (or document manual checks). If tests exist, add a test to ensure review count uses `/progress/reviews`.

**Step 2: Update API**

- Add `getReviewCount()` → `GET /progress/reviews`
- Add `getReviewSession()` → `GET /words/review`

**Step 3: Update Dashboard**

- Use `getReviewCount()` for `reviewCount`.

**Step 4: Update Engine**

- Use `getReviewSession()` for review mode.

**Step 5: Manual verification**

- Dashboard shows total pending count even if >30.
- Review session loads 30 words.

**Step 6: Commit**

```bash
git add /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/client/src/api.js \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/client/src/engine.js \
        /Users/samuelying/程序/02-项目/vocab-master-2.0/.worktrees/codex/review-srs/client/src/components/Dashboard.vue

git commit -m "feat: use total pending review count and session endpoint"
```

---

Plan complete and ready for execution.
