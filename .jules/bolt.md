## 2024-05-24 - Selector referential equality
**Learning:** Returning `data || []` inline inside a `useSelector` breaks referential equality by returning a new array reference on every store update when `data` is falsy. This causes unnecessary re-renders in components using the selector.
**Action:** Extract a constant `EMPTY_ARRAY = []` outside the component and return `data || EMPTY_ARRAY` within the selector, or handle the fallback outside of the selector completely.
