## 2024-05-14 - Prevent Unnecessary Re-renders from inline literals in Redux
**Learning:** Returning inline literal arrays (e.g. `|| []`) from Redux `useSelector` hooks forces unnecessary component re-renders on every store update because it creates a new reference each time.
**Action:** Extract empty arrays or objects to a stable constant outside the component or hook like `const EMPTY_ARRAY = [];` to maintain referential equality.
