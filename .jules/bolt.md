## 2023-10-24 - Stable Reference in useSelector
**Learning:** Returning inline literals like `[]` or `{}` in `useSelector` breaks referential equality, forcing components to re-render on every Redux store update, even if the relevant slice didn't change.
**Action:** Always extract fallback arrays or objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook to maintain referential equality.
