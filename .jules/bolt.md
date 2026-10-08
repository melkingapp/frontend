## 2026-10-08 - Optimize useSelector for Performance
**Learning:** Selecting entire state slices (e.g., `useSelector(state => state.requests)`) in list items and forms causes unnecessary O(n) re-renders whenever any part of that state updates.
**Action:** Always extract specific primitive values (e.g., `useSelector(state => state.requests.updateLoading)`) to ensure optimizations remain effective.
