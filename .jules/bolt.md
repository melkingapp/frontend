## 2025-01-09 - Prevent unnecessary re-renders with constant fallback array
**Learning:** Using inline fallback arrays `|| []` inside `useSelector` forces the selector to return a new object reference on every Redux state update, which causes widespread unnecessary component re-renders. Wrapping this in `useMemo` is not efficient.
**Action:** Always define a stable module-level constant (e.g., `const EMPTY_ARRAY = []`) outside the component and use it as the fallback value in `useSelector` to maintain referential equality and save rendering overhead.
