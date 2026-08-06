## 2024-08-06 - Stable References in Redux Selectors
**Learning:** Returning inline literal arrays (e.g., `[]`) or objects as fallbacks in Redux `useSelector` hooks creates a new reference on every state change, causing unnecessary re-renders of components even when unrelated state updates occur.
**Action:** Always extract static fallback values (like `const EMPTY_ARRAY = [];`) outside the component or hook to maintain referential equality and optimize performance.
