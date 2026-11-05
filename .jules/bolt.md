## 2024-05-24 - Performance Optimizations
**Learning:** Selecting full Redux state slices (e.g., `useSelector(state => state.requests)`) in list items causes O(N) re-renders when any property in the slice changes.
**Action:** Always select specific primitive properties (e.g., `useSelector(state => state.requests.updateLoading)`) to avoid unnecessary re-renders in list components.
