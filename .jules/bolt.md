## 2026-07-08 - Redux Selector Array Fallbacks
**Learning:** Found instances where `useSelector` returns a literal `[]` (e.g., `state.finance.transactions || []`). This is a performance anti-pattern because the literal array creates a new reference on every Redux state update, bypassing `useSelector`'s strict equality check and causing unnecessary component re-renders.
**Action:** Extracted the fallback array to a stable top-level constant `const EMPTY_ARRAY = [];` and used it in the selectors to maintain referential equality and prevent re-renders.
