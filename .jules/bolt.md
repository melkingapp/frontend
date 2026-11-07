## 2024-11-07 - Avoid full Redux state slice selections in list items
**Learning:** Selecting a full state slice in a Redux-connected list item component (like `useSelector(state => state.payments)`) causes O(N) performance bottlenecks because every item in the list re-renders when *any* part of that state slice changes, even properties it doesn't use.
**Action:** Always select specific primitive properties (e.g., `useSelector(state => state.payments.loading)`) instead of the full slice in list components.
