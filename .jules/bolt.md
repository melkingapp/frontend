## 2024-05-24 - React Redux Re-render Fallback Anti-Pattern
**Learning:** Using `|| []` directly in `useSelector` returns a new reference on every store update, causing unnecessary re-renders in components and triggering cascaded recalculations in any hooks (like `useMemo` or `useEffect`) that depend on the returned array.
**Action:** Always define a constant `const EMPTY_ARRAY = []` outside the component and use it as the fallback to maintain referential stability.
