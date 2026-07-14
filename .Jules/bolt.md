## 2024-05-18 - Stable arrays in useSelector
**Learning:** Returning literal arrays like `state.finance.transactions || []` in `useSelector` causes new array references to be returned on every state update, leading to unnecessary re-renders of components using this selector.
**Action:** Extract literal arrays to a stable constant outside the component: `const EMPTY_ARRAY = [];` and use it as the fallback.
