## 2024-06-16 - Referential Equality in Redux Selectors
**Learning:** Returning a literal fallback array like `useSelector(state => state.finance.transactions || [])` breaks referential equality in React/Redux. Because `[]` creates a new reference on every store update (even unrelated ones), this forces unnecessary re-renders of the component and any downstream `useMemo`/`useEffect` hooks that depend on it.
**Action:** Always define a constant empty array/object outside the component/hook (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback to maintain referential stability.
