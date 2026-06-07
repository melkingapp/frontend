## 2024-06-07 - React/Redux referential equality in useSelector
**Learning:** Returning a fallback literal array `|| []` directly from `useSelector` without memoization breaks referential equality because it creates a new reference on every store update. This forces unnecessary component re-renders.
**Action:** Always define a constant empty array `const EMPTY_ARRAY = [];` outside the component/hook and use it as the fallback to maintain referential stability.
