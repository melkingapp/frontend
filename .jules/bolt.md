## 2024-05-14 - Expensive Array Operations Inside Render

**Learning:** Large dataset filtering directly inside the functional component body blocks the main thread during every re-render (which can happen frequently on inputs/search text changes).
**Action:** Wrap expensive derived state calculations, like `.filter()` arrays or `.map()` transformations over large datasets, inside a `useMemo` hook, ensuring that recalculation only triggers when necessary dependencies change.
