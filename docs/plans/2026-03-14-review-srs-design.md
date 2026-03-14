# Review SRS Redesign Design

**Goal:** Implement a fixed-step review schedule (10min → 1d → 3d → 7d → 15d → 30d → 60d → 120d) with a mixed review pool (mistakes + due reviews), random ordering, and a 30-word per-session cap, while showing the total pending review count on the dashboard.

**Scope:** Server-side SRS logic and review selection; minimal client adjustments to display total pending count and request a 30-word review session.

## Requirements (Confirmed)

1. **Mixed review pool**: review candidates = `mistakeCount > 0` + `nextReview <= now` (dedupe by word).
2. **Random ordering**: review sessions are randomized (no priority ordering).
3. **Session cap**: each review session returns at most 30 words.
4. **Dashboard count**: show total pending review count (sum of all candidates), even if >30.
5. **Review schedule (fixed steps)**:
   - 10 minutes
   - 1 day
   - 3 days
   - 7 days
   - 15 days
   - 30 days
   - 60 days
   - 120 days
6. **Answer handling**:
   - Learning-phase wrong answers: add to review pool with `reviewStage=0` and `nextReview=now+10min`.
   - Review-phase correct answers: advance `reviewStage` (0→1→…→7) and set `nextReview` to corresponding interval.
   - Review-phase wrong answers: reset to `reviewStage=0` and `nextReview=now+10min`, and re-enter review pool.
7. **Single review batch size**: 30 words (same as learning session size).

## Data Design

- Continue using `studyRecord` as the single source of truth.
- Add `reviewStage` integer (0–7).
- `interval` is retained for compatibility but no longer drives review schedule.
- For legacy rows without `reviewStage`, default to `0`.

## API Contract Changes

- `GET /progress/reviews`: return total pending review count + optional preview list, or keep current payload but ensure `total` reflects the mixed pool count.
- `GET /words/review`: return up to 30 randomized review words from mixed pool, with `_reviewData` in response.

## Client Behavior

- Dashboard “待复习词” uses total pending count from `/progress/reviews`.
- Review entry calls `/words/review` and loads the 30-word session.

## Error Handling

- If total pending count is 0, dashboard should remain 0 and review entry should show “暂无待复习单词”。

## Test Plan

- Unit tests for review schedule step progression.
- Unit tests for mixed pool logic and randomization (stable check via seeded shuffle or stubbed random).
- Contract test to ensure `/progress/reviews` reports total count and `/words/review` caps at 30.

