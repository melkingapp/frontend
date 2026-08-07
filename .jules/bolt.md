## 2025-02-07 - Prevent unnecessary re-renders in useSelector
**Learning:** Found an anti-pattern where inline arrays `|| []` inside `useSelector` hooks cause components to re-render on every Redux store update when the default fallback is used.
**Action:** Always extract default arrays (or objects) to stable constants like `const EMPTY_ARRAY = []` outside the component scope to maintain referential equality and prevent unnecessary re-renders.
