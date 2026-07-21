## 2024-07-21 - Extract inline array fallbacks in useSelector hooks
**Learning:** Inline literal arrays (like `|| []`) in Redux `useSelector` hooks create new referential identities on every store update, causing unnecessary re-renders of components even when the underlying data is empty or hasn't changed.
**Action:** Always extract fallback arrays or objects to stable constants (e.g., `const EMPTY_ARRAY = []`) defined outside the component or hook to maintain referential equality and optimize rendering performance.
