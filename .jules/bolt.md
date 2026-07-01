## 2024-05-18 - React/Redux Performance Pattern
**Learning:** Returning a literal fallback array (e.g., `|| []`) directly inside a `useSelector` hook breaks referential equality, returning a new reference on every Redux store update and forcing unnecessary component re-renders.
**Action:** Always extract such fallbacks to a stable constant (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook.
