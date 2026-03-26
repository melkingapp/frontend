## 2025-02-28 - Optimized Unnecessary Re-renders in `ResidentDashboard.jsx`
**Learning:** `approvedRequests` computation was running inside the component body, meaning a `.filter()` iteration ran on every single render. Using `useMemo` specifically limits this expensive operation to run *only* when `membershipRequests` change.
**Action:** Always wrap derived filtering or mapping of large lists, such as calculating active users or requests, inside `useMemo` to prevent slowing down component updates.
