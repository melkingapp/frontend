## 2024-05-26 - Prevent React Re-renders from useSelector Fallbacks
**Learning:** Returning a literal fallback array like `[]` or `|| []` directly from `useSelector` breaks referential equality, causing the component to re-render on every single Redux store update, regardless of whether the selected slice actually changed.
**Action:** Extract the fallback array to a constant outside the component `const EMPTY_ARRAY = [];` and return that, or avoid the fallback inside the `useSelector` and handle it downstream.
