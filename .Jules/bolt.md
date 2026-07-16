## $(date +%Y-%m-%d) - Prevent unnecessary re-renders in Redux useSelector
**Learning:** Returning inline literal arrays (e.g., `data || []`) directly from Redux `useSelector` hooks creates a new reference on every state change, causing unnecessary re-renders of the component.
**Action:** Always extract these fallbacks to stable constants (e.g., `const EMPTY_ARRAY = [];`) defined outside the component or hook to maintain referential equality.
