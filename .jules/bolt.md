## 2026-09-25 - Optimize Redux useSelector in Lists
**Learning:** Destructuring entire state slices in `useSelector` (e.g., `const { loading } = useSelector(state => state.payments)`) inside list item components forces O(n) re-renders for every item whenever ANY unrelated field in that slice updates. Selecting primitive values directly (e.g., `state.payments.loading`) prevents this.
**Action:** Always select specific primitives or narrow nested objects in Redux selectors, especially within mapped list components.
