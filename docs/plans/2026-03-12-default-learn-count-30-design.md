# Default Learn Count 30 - Design

## Overview
Set the default number of words per learning session to 30 across the mini‑program, and ensure the daily goal/progress UI reflects 30. This change must apply to all default entry points and restart flows.

## Scope
- Default count used when starting a learning session without an explicit count.
- Dashboard daily goal display and progress calculation.
- “Play again/continue” in results page.
- Legacy v1 dashboard start button.

## Non‑Goals
- User‑configurable session length.
- Changing review/mistake/PK counts.

## Approach
Introduce a single shared constant `DEFAULT_LEARN_COUNT = 30` and use it wherever the default count or daily goal is currently hardcoded as 10. This ensures consistency and future changes require only a single edit.

## Affected Files (expected)
- `client-uni/src/constants.js` (new)
- `client-uni/src/api.js`
- `client-uni/src/engine.js`
- `client-uni/src/components/Dashboard.vue`
- `client-uni/src/components/Dashboard.v2-control-center.vue`
- `client-uni/src/components/Result.vue`
- `client-uni/src/components/Dashboard.v1-stitch.vue`

## Data Flow
- `DEFAULT_LEARN_COUNT` is imported by API/engine and UI components.
- Dashboard shows `todayLearned / DEFAULT_LEARN_COUNT` and progress percent uses the same constant.
- `GameEngine.startSession()` default uses the constant.

## Error Handling
No new error handling is required. Existing behavior remains unchanged aside from the new default count.

## Testing
Manual verification:
1. Home/dashboard shows goal 30 and progress percentage based on 30.
2. Start learning runs a 30‑word session.
3. Result “play again” starts 30.

## Rollback
Revert the constant to 10 or revert the commit.
