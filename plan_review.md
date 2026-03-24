1. **Optimize `ResidentSidebar.jsx`**:
    - The `ResidentSidebar` component does several array filters (`filter()`) on `membershipRequests` directly inside the component body, which means these run on every render.
    - Specifically, `userRole`, `pendingRequestsCount`, and `approvedUnits` compute filtered values.
    - I'll wrap these derived variables in `useMemo` hooks to memoize the results based on `membershipRequests`.

2. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
