## 2024-05-24 - [Avoid Literal Arrays in useSelector]
**Learning:** Returning a literal fallback array (`|| []`) directly from a `useSelector` hook breaks referential equality, returning a new reference on every Redux store update and forcing unnecessary component re-renders.
**Action:** Always extract fallback arrays/objects to a stable constant (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook.
