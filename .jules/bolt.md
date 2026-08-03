## 2026-08-03 - Prevent Unnecessary Re-renders from Redux Selectors
**Learning:** Returning inline literals like `|| []` inside `useSelector` creates a new reference on every state update, breaking referential equality and causing unnecessary re-renders in components.
**Action:** Always extract fallback arrays/objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook when using `useSelector`.
