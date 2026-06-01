## 2024-05-24 - Referential equality breakage with inline fallback in useSelector
**Learning:** Returning an inline fallback array (e.g. `useSelector(state => state.finance.transactions || [])`) creates a new array reference on every Redux store update. This causes any component using this hook to re-render needlessly when unrelated store updates occur.
**Action:** Define `const EMPTY_ARRAY = []` outside the component and use it as the fallback to maintain referential stability.
