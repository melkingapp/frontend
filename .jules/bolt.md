## 2026-07-12 - Stable Array Constants in useSelector
**Learning:** Returning inline literal arrays (e.g., '|| []') directly from Redux useSelector hooks breaks referential equality and causes unnecessary component re-renders on unrelated state changes.
**Action:** Always extract array and object fallbacks to stable constants (e.g., 'const EMPTY_ARRAY = [];') defined outside the component or hook.
