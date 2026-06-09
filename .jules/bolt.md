## 2025-05-18 - [useSelector referential equality optimization]
**Learning:** Returning a literal fallback array or object (e.g., `return data || []`) directly from `useSelector` breaks referential equality because it creates a new reference on every store update. This forces unnecessary component re-renders.
**Action:** Always define a constant empty array/object outside the component/hook (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback in `useSelector` to maintain referential stability.
