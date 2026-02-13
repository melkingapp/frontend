# Bolt's Journal

## 2024-02-09 - [Inline Grouping Logic Cost]
**Learning:** Performing O(n) grouping and sorting operations (Maps, loops) directly in the component body (or render phase) causes significant recalculations on every unrelated re-render (e.g., modal toggles).
**Action:** Extract complex data transformation logic into `useMemo` hooks, especially when the source data (`dataSource`) is stable but UI state (`isCreateOpen`) changes frequently.
