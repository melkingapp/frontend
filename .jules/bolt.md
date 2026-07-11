## 2024-07-11 - Prevent unnecessary re-renders from useSelector default values
**Learning:** Returning inline literal arrays like `|| []` directly inside a Redux `useSelector` breaks referential equality, causing the component or hook to re-render every time the Redux store updates, even if the relevant slice data hasn't changed.
**Action:** Always extract fallback arrays or objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component/hook scope.
