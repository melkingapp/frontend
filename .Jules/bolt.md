## 2024-06-26 - Fix referential stability in Redux selectors
**Learning:** Returning a literal fallback array or object (e.g., `data || []`) directly from a `useSelector` hook breaks referential equality, returning a new reference on every Redux store update and forcing unnecessary component re-renders.
**Action:** Always extract such fallbacks to a stable constant (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook.
