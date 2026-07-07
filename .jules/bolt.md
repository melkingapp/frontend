## 2026-07-07 - Stable Fallback Arrays in Redux Selectors
**Learning:** Returning a literal fallback array like `[]` directly from a `useSelector` hook breaks referential equality, returning a new reference on every Redux store update and forcing unnecessary component re-renders.
**Action:** Always extract such fallbacks to a stable constant like `const EMPTY_ARRAY = [];` defined outside the component or hook to maintain referential equality.
