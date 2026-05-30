## 2024-05-30 - useSelector Default Value Causes Re-renders
**Learning:** Returning a literal fallback array or object (e.g., `state.finance.transactions || []`) directly from `useSelector` breaks referential equality because it creates a new reference on every store update. This forces unnecessary component re-renders.
**Action:** Always define a constant empty array/object outside the component/hook (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback in `useSelector` to maintain referential stability.
