## 2026-11-01 - Prevent O(N) performance bottlenecks in Redux selectors
**Learning:** To prevent O(N) performance bottlenecks in Redux-connected list item components (like `PaymentItem` or `RequestItem`), avoid selecting full state slices (e.g., `useSelector(state => state.requests)`). Instead, always select specific primitive properties (e.g., `useSelector(state => state.requests.updateLoading)`).
**Action:** Update list item components to select specific primitive values from the Redux store to avoid unnecessary re-renders of all items when the state changes.
