## 2026-10-03 - Optimize Redux useSelector in List Items
**Learning:** Selecting entire Redux slice objects (e.g., `useSelector(state => state.payments)`) in list items creates unnecessary subscriptions. When any property in the slice updates, it triggers widespread re-renders across all list components.
**Action:** Always select specific, minimal properties needed by the component (e.g., `useSelector(state => state.payments.loading)`) or completely remove unused `useSelector` calls in list item components to preserve performance and ensure `React.memo` remains effective.
