## 2025-02-12 - Prevent Re-renders in Redux Selectors
**Learning:** Found instances where `useSelector(state => state.finance.transactions || [])` returned inline literal arrays directly from Redux `useSelector` hooks. This causes referential inequality on every render when transactions is falsy, triggering unnecessary re-renders.
**Action:** Always extract fallback arrays/objects to stable constants (e.g. `const EMPTY_ARRAY = [];`) defined outside the component/hook.
