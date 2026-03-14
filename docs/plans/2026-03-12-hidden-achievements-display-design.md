# Hidden Achievements Display - Design

## Overview
Hide two special achievements (spec_night, spec_morning) when they are not unlocked. All other achievements remain visible in a greyed state when locked.

## Scope
- Achievement wall display logic only.
- Two achievement IDs: `spec_night`, `spec_morning`.

## Non-Goals
- Changing unlock rules or storage of achievements.
- Backend/cloud function changes.

## Approach
Apply a front-end filter in `AchievementWall.vue` to exclude the two hidden achievements when they are locked. Once unlocked, they should appear normally in the SPECIAL category.

## Affected Files
- `miniprogram/src/components/AchievementWall.vue`

## Data Flow
- Compute `visibleAchievements` from `GameState.system.achievements`.
- For achievements with id in hidden set, include only if `isUnlocked(id)`.
- UI uses `visibleAchievements` instead of raw list for category rendering and counts.

## Error Handling
No changes needed.

## Testing
Manual:
1. With no unlocks for `spec_night`/`spec_morning`, they should not appear.
2. After unlocking each, it should appear under SPECIAL.
3. Other achievements still show greyed when locked.

## Rollback
Revert the UI filter or restore original `achievements` list usage.
