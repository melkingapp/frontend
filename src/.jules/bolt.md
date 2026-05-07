## 2024-05-15 - Stable Array Fallbacks inside Redux Selectors
**Learning:** Returning inline literal array fallbacks like `|| []` inside `useSelector` callbacks triggers a re-render for every Redux dispatch because the selector returns a new reference even if the state value is strictly falsy.
**Action:** Extract `[]` to a module-level constant `const EMPTY_ARRAY = [];` and use that stable reference as the fallback inside `useSelector` and other array assignment operations that rely on referential equality.
