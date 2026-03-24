
## 2026-03-24 - [Optimize Re-renders in ResidentSidebar]
**Learning:** Found multiple array filtering operations (`filter`, `some`, `forEach`) running directly in the render body of `ResidentSidebar.jsx`, which caused expensive calculations on every render.
**Action:** Wrapped `userRole` and `approvedUnits` computations inside `useMemo` hooks with `membershipRequests` as the dependency array to memoize the values. Cleaned up unused Redux selections and unused variables.
