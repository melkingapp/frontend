# Bolt's Journal

## 2024-05-23 - Initial Setup
**Learning:** Project uses `moment` for date handling which can be expensive in loops.
**Action:** Use `useMemo` for derived data involving `moment` parsing, especially in render-heavy components like modals.
