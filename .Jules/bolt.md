## 2024-05-18 - [Referential Equality in Redux Selectors]
**Learning:** Returning inline literal arrays (e.g., `data || []`) from `useSelector` breaks referential equality, causing components to re-render on every store update even if the relevant state hasn't changed.
**Action:** Always extract fallback arrays or objects to stable constants (e.g., `const EMPTY_ARRAY = []`) defined outside the React component or hook.
