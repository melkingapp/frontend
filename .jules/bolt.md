## 2024-05-19 - [Memoize fallback array in useSelector]
**Learning:** Returning a literal fallback array `[]` from `useSelector` (e.g. `return ... || [];`) causes unnecessary component re-renders because `[] !== []`. The array reference changes every time the selector runs and the fallback is returned. This causes any hooks (like `useEffect` or `useMemo`) that depend on the variable to fire.
**Action:** Define an empty array constant `const EMPTY_ARRAY = []` outside the component and return it instead of `[]`.
