## 2024-03-24 - React useSelector Fallback Pattern
**Learning:** Found a common performance anti-pattern across multiple files where `useSelector(state => state.foo || [])` was used. This causes the selector to return a brand new array reference on *every* single unrelated state change if `state.foo` is falsy, triggering unnecessary component re-renders.
**Action:** Always extract empty fallback arrays to a module-level constant (e.g., `const EMPTY_ARRAY = [];`) and use that constant in the selector instead, ensuring referential equality is maintained when the fallback is used.
