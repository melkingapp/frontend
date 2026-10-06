## 2024-10-06 - Optimize useSelector in List Items
**Learning:** Selecting entire Redux slices (e.g., `useSelector(state => state.payments)`) in list item components causes unnecessary O(n) re-renders across all items when any unrelated data in that slice updates.
**Action:** Always select specific primitive values (e.g., `useSelector(state => state.payments.loading)`) in list items to ensure they only re-render when the data they actually consume changes.
