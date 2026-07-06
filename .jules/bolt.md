## 2024-05-15 - Initial
**Learning:** Initial learning
**Action:** Initial action
## 2026-07-06 - React Redux Performance Anti-Pattern
**Learning:** Returning a literal fallback array (e.g., `data || []`) directly from a `useSelector` hook breaks referential equality, returning a new reference on every Redux store update and forcing unnecessary component re-renders.
**Action:** Always extract such fallbacks to a stable constant (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook.
