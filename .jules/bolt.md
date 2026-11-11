## 2024-05-15 - Redux O(N) List Re-renders
**Learning:** Selecting full Redux state slices (e.g., state.requests) inside list items causes all items to re-render when any unrelated property in that slice changes.
**Action:** Always select specific primitive properties (e.g., state.requests.updateLoading) in list components to prevent O(N) performance bottlenecks.
