
## 2026-05-01 - Memoize shared expenses array filtering
**Learning:** Avoid running expensive array operations like `.filter()` directly inside JSX or render logic, as this blocks the main thread on every render. Furthermore, using inline arrays (e.g. `|| []`) allocates a new array in memory every time.
**Action:** Always wrap array filtering in `useMemo` and define stable `const EMPTY_ARRAY = []` variables outside of the component to preserve referential equality and optimize performance.
