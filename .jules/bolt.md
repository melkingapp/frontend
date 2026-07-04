## 2025-07-04 - Prevent Unnecessary Re-renders with Stable References in useSelector
**Learning:** Returning a literal fallback array like `data || []` directly inside a Redux `useSelector` hook breaks referential equality, returning a new reference on every state update and forcing unnecessary component re-renders.
**Action:** Always extract such fallbacks to a stable constant (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook to ensure `useSelector` returns the exact same reference when no data is present.
