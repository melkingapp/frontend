## 2025-03-10 - useSelector Inline Fallback Re-renders
**Learning:** Returning a literal fallback array (`|| []`) directly from a `useSelector` hook in Redux breaks referential equality, returning a new reference on every state update and forcing unnecessary component re-renders.
**Action:** Always extract such fallbacks to a stable constant (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook.
