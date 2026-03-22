
## 2025-05-18 - [Optimization of Array Filtering in RegularRequestsManager]
**Learning:** Found a pattern in `RegularRequestsManager.jsx` where expensive array filtering operations (`requests.filter(...)`) were executed synchronously during every component render. Since the component has nested modals that trigger re-renders, these recalculations waste CPU cycles and block the main thread.
**Action:** Wrapped the base filtered requests list and derived status counts in `useMemo` hooks, keyed by the root dependency (`requests`). Removed inline filtering in JSX and used the memoized count.
