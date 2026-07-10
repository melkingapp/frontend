## 2024-07-10 - useSelector Referential Equality Optimization
**Learning:** Returning inline array literals (like `|| []`) inside `useSelector` hooks breaks referential equality, causing the component to re-render on every single Redux state change, even when the actual array contents are identical. This is a severe performance bottleneck.
**Action:** Always extract fallback arrays or objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook to maintain referential equality.
