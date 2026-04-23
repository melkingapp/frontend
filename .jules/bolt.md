## 2024-05-24 - Array fallback references inside useSelector
**Learning:** Returning a newly created fallback array inside `useSelector` (e.g. `state => state.foo.bar || []`) allocates a new array on *every single store evaluation/render*, destroying referential equality and causing unnecessary downstream re-renders of any component using that data.
**Action:** Extract a stable fallback array `const EMPTY_ARRAY = []` outside the component scope and use it as the fallback.
