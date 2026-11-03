## 2024-05-15 - Redux useSelector O(N) Re-render Bottleneck
**Learning:** Redux-connected list item components (like RequestItem and PaymentItem) were selecting full state slices (e.g., useSelector(state => state.requests)) instead of primitive properties. Since slice object references change on any state update, this caused O(N) unnecessary re-renders of the entire list whenever any unrelated state in the slice changed.
**Action:** Always select specific primitive properties or use memoized selectors in list item components to prevent O(N) render bottlenecks.
