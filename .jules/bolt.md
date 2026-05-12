
## 2024-05-12 - Inline Fallback Arrays in useSelector
**Learning:** Using inline empty arrays `|| []` inside `useSelector` causes the selector to return a new array reference on every store update if the main value is falsy. This violates referential equality, leading to unnecessary and potentially expensive downstream re-renders in components depending on that state.
**Action:** Always define a module-level constant like `const EMPTY_ARRAY = [];` outside the component and use it as the fallback value in `useSelector(state => state.items || EMPTY_ARRAY)` to maintain stable references.
