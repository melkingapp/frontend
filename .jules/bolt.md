## 2024-05-18 - [Optimize UnitTransactionsSummary Filtering]
**Learning:** Avoid running array filtering operations directly inside JSX render methods (like `(array || []).filter(condition).length`), especially for frequently re-rendered components, as it can cause main-thread blocking on large datasets.
**Action:** Wrap such calculations in `useMemo` hooks (e.g. `const count = useMemo(() => array.filter(...).length, [array])`) to memoize the result.
