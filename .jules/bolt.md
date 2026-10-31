## 2025-02-23 - Redux Full Slice Selection in List Items
**Learning:** Selecting full Redux state slices (like `state => state.payments`) inside list item components causes O(N) performance bottlenecks, as any slice update triggers a re-render for all items.
**Action:** Always select specific primitive properties (e.g., `state => state.requests.updateLoading`) or remove unused slice selections entirely in list item components.
