## 2024-07-17 - Avoid Inline Array Fallbacks in useSelector
**Learning:** Returning inline literal arrays (e.g. `data || []`) directly from Redux `useSelector` hooks causes the selector to return a new reference on every store state change. This forces React to re-render the component unnecessarily, which is a common frontend performance bottleneck.
**Action:** Always extract array and object fallbacks to stable constants (e.g., `const EMPTY_ARRAY = [];`) outside of the component or hook to maintain referential equality across state updates.
