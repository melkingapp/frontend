## 2024-05-18 - Prevent O(N) Re-renders in Redux List Items
**Learning:** Selecting full state slices in list items (e.g., `useSelector(state => state.requests)`) creates O(N) re-render bottlenecks because the component re-renders every time any property in the slice changes.
**Action:** Always select specific primitive properties (e.g., `useSelector(state => state.requests.updateLoading)`) to ensure list items only re-render when their required state actually updates.
