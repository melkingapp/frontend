## 2024-06-28 - Stable Fallback Arrays in Redux Selectors
**Learning:** Returning literal fallback arrays like `[]` directly in `useSelector` breaks referential equality, causing a new array reference on every Redux store update and forcing unnecessary re-renders of downstream components.
**Action:** Always extract fallback structures to a stable constant outside the component or hook to maintain referential stability.
