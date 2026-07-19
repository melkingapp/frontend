## 2025-03-03 - Stable Fallbacks in useSelector
**Learning:** Returning literal arrays `[]` or objects `{}` from Redux `useSelector` hooks as fallbacks breaks referential equality, causing React components to re-render unnecessarily on any Redux state change, even when the relevant state hasn't changed.
**Action:** Always extract fallback arrays/objects to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook to ensure referential equality.
