## 2026-06-30 - Fix Redux Unstable Fallbacks
**Learning:** Returning inline literal array `[]` fallbacks in `useSelector` breaks referential equality, forcing unnecessary re-renders.
**Action:** Always extract `[]` or `{}` fallbacks into stable constants defined outside the React component or hook.
