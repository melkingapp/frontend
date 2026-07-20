## 2024-07-20 - Prevent re-renders from useSelector fallback arrays
**Learning:** Returning inline literal arrays (e.g., `data || []`) directly from Redux `useSelector` hooks breaks referential equality, causing unnecessary re-renders on every store update.
**Action:** Always extract fallback arrays/objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook.
