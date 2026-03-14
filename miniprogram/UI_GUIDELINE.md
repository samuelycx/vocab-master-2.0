# UI Guideline (miniprogram)

## Goal
- Keep all pages in one visual language.
- Prefer reusable theme classes over per-page hardcoded colors.

## Source of truth
- Theme tokens: `src/styles/ui-theme.css`
- Global import: `src/style.css`

## Required classes
- Page root: `.app-page`
- Top bar: `.app-topbar`
- Icon/utility button: `.app-icon-btn`
- Default card: `.app-card`
- Strong/highlight card: `.app-card-strong`
- Input/search: `.app-input`

## Color usage
- Primary action color: `--ui-primary`
- Base background: `--ui-bg`
- Card surface: `--ui-surface`
- Border: `--ui-border`
- Candy blocks only for key actions:
  - `.app-candy-mint`
  - `.app-candy-sky`
  - `.app-candy-lemon`
  - `.app-candy-pink`

## UX rules
- Do not make static metrics look clickable.
- Every primary card in dashboard must map to a real feature.
- If backend data is unavailable, show explicit empty-state text, not blank areas.
- Keep back navigation visible in all non-dashboard pages.

## Implementation checklist for new page
- Add `.app-page` to root.
- Use `.app-topbar` + `.app-icon-btn` in header.
- Replace raw white cards with `.app-card` / `.app-card-strong`.
- Replace raw input styles with `.app-input`.
- Keep text contrast readable on light background.
