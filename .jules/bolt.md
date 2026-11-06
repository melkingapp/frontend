## 2024-05-24 - Redux List Item O(N) Re-renders
**Learning:** Selecting full Redux state slices in list item components (e.g., useSelector(state => state.requests)) causes an O(N) performance bottleneck because all items re-render when any property in the slice updates.
**Action:** Always select specific primitive properties (e.g., useSelector(state => state.requests.updateLoading)) to prevent unnecessary global re-renders in lists.
