## 2026-03-28 - [Optimized BalanceCharts and BalanceTable Array Operations]
**Learning:** Wrapping expensive array filtering/mapping operations (e.g. `filter`, `map`, and reducing) within `useMemo` hooks in rendering loops is an essential pattern for preventing main-thread blocking when working with transaction data sets in React components.
**Action:** Always wrap array transformations on large data props inside `useMemo` to prevent expensive recalculations during unrelated re-renders.
