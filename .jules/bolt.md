## 2024-11-20 - Redux Selector Referential Equality
**Learning:** Returning a literal array (e.g. `|| []`) from `useSelector` breaks referential equality in React, causing components to re-render every time the Redux store updates, even if the relevant slice of state is empty.
**Action:** Always define a constant empty array/object outside the component (e.g., `const EMPTY_ARRAY = [];`) and use it as the fallback to maintain referential stability.
