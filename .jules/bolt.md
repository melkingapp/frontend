## 2024-11-08 - Prevent O(N) Re-renders in Redux-Connected List Items
**Learning:** Selecting full state slices (e.g., `useSelector(state => state.requests)`) in list item components causes severe O(N) performance bottlenecks. Every list item re-renders whenever any part of the slice changes.
**Action:** Always select specific primitive properties (e.g., `useSelector(state => state.requests.updateLoading)`) to avoid unnecessary renders.
