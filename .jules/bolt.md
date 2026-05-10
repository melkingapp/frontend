## 2024-05-10 - Memoization of Filtering Array
**Learning:** In a codebase, `useResidentUnitData` computes and memoizes `approvedUnits` via `useMemo`. However, other components like `ResidentSidebar` and `DashboardResident` independently recalculate the exact same filtered subset arrays on every render (using `.filter()`).
**Action:** Find existing memoized computations from hooks (e.g. `approvedUnits`) and export/use them across components to prevent redundant non-memoized mapping and filtering arrays directly inside the render loop.
