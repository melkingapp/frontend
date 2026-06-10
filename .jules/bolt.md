## 2024-06-10 - useSelector Referential Equality Issue with Inline Fallbacks
**Learning:** Using inline fallback arrays or objects like `useSelector(state => state.data || [])` creates a new reference on every store update if the value is falsy. This forces unnecessary component re-renders and defeats the purpose of subsequent `useMemo` hooks that rely on that data.
**Action:** Always define a constant empty array/object outside the component or hook (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback inside `useSelector` to maintain referential stability.
