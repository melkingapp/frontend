## 2024-05-27 - React/Redux Performance Pattern: Fallback Values
**Learning:** Returning a literal fallback array (e.g., `return data || []`) from `useSelector` breaks referential equality because a new array reference `[]` is created on every store update or render. This forces unnecessary re-renders of the components using this hook, even when the data itself hasn't changed.
**Action:** Always define a constant empty array/object outside the component/hook (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback to maintain referential stability.
