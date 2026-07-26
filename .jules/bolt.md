## 2024-07-26 - Prevent Unnecessary Re-renders from inline fallback arrays in useSelector

**Learning:** Returning inline literal arrays (e.g., `state.finance.transactions || []`) directly from `useSelector` hooks in React/Redux causes the component to re-render unnecessarily every time the state updates, because `[] !== []` referentially.

**Action:** Always extract these fallbacks to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook to maintain referential equality and prevent performance bottlenecks.
