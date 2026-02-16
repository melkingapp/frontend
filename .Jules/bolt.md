## 2024-05-23 - Render Loop Calculations
**Learning:** Heavy calculations (filtering, sorting, grouping) inside the render return block (JSX) run on every render, causing performance issues in large lists like `UnitBase`.
**Action:** Move such logic into `useMemo` hooks to ensure it only re-runs when dependencies change.
