## 2024-08-09 - Memoize expensive array operations in render

**Learning:** Re-computing array filtering, reducing, or transformation in a React component's main body can cause performance lag, especially in frequently re-rendered elements like sidebars. Even if a custom hook like `useResidentUnitData` exposes some data, components might still do custom, expensive derivations on it (like grouping requests to match a specific UI format).

**Action:** Look for IIFEs (Immediately Invoked Function Expressions) or function calls in the component body that process arrays and convert them to `useMemo` hooks with correct dependency arrays to ensure referential stability and skip unnecessary work on re-renders.
