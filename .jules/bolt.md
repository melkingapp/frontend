## 2026-11-09 - Prevent O(N) performance bottlenecks in Redux list components
**Learning:** Selecting the entire state slice in list components (e.g., `useSelector(state => state.requests)`) causes O(N) memory allocation and O(N) unnecessary re-renders across the entire list when a single primitive property (like `updateLoading`) changes during an action.
**Action:** Always select specific primitive properties (e.g., `useSelector(state => state.requests.updateLoading)`) to prevent O(N) bottlenecks in Redux-connected list item components.
