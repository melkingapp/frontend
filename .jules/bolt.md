## 2024-05-30 - Prevent O(n) re-renders in Redux lists
**Learning:** Selecting entire Redux state slice objects (e.g., `useSelector(state => state.payments)`) in list item components triggers widespread unnecessary re-renders across all items when any unrelated data in that slice updates. This nullifies optimizations like `React.memo`.
**Action:** Always select specific primitive values (e.g., `useSelector(state => state.payments.loading)`) within list items, and wrap the component in `React.memo()` to ensure they only re-render when their specific data changes.
