## 2024-05-19 - Optimize Role Calculation in Headers
**Learning:** React component renders often compute derived state via sequential high-order array methods (`.filter().some()`) which execute on every render.
**Action:** When a computed value depends on arrays and involves sequential expensive operations, memoize the calculation with `useMemo` and rewrite the logic to use single-pass `for` loops with early breaks to minimize iterations and overhead.
