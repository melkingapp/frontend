## 2024-07-31 - Redux useSelector Referential Equality
**Learning:** Returning inline literal arrays (e.g., `data || []`) directly from Redux `useSelector` hooks in React components causes unnecessary re-renders because a new array reference is created on every state update, even if the underlying data hasn't changed. This is a common performance pitfall in Redux applications.
**Action:** Always extract fallback arrays or objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook to maintain referential equality and prevent re-renders.
