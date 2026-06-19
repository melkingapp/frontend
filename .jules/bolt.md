## 2024-05-18 - Referential Equality in useSelector
**Learning:** Returning a literal fallback array `[]` or object `{}` directly from `useSelector` breaks referential equality because it creates a new reference on every store update. This forces unnecessary component and hook re-renders even if the actual data hasn't changed.
**Action:** Always define a constant empty array or object outside the component/hook (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback to maintain referential stability.
