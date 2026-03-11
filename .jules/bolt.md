## 2025-02-28 - Optimize Unique Request Calculation in BuildingRequestStatus
**Learning:** In `BuildingRequestStatus.jsx`, expensive array operations (filtering, grouping, and custom sorting) were being performed inline within the render method to determine `uniqueRequests`. This caused performance issues during frequent re-renders since the array operations block the main thread.
**Action:** Wrapped the calculation inside a `useMemo` hook with a dependency on `requests` to prevent unnecessary recalculations.
