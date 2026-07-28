## $(date +%Y-%m-%d) - useSelector Redundant Rendering Pattern
**Learning:** Found a common anti-pattern in the Redux selectors across the app where fallback defaults were returning literal arrays like `[]`. Returning new inline object or array references bypasses Redux referential equality checks, resulting in widespread redundant re-renders throughout the component tree.
**Action:** Always extract static fallbacks like `EMPTY_ARRAY = []` or `EMPTY_OBJECT = {}` to stable top-level constants outside the component scope to preserve referential equality and optimize rendering performance.
