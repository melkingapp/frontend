## 2024-08-18 - React.memo/useSelector performance improvement

**Learning:** Returning fresh arrays directly in Redux `useSelector` hooks (e.g. `useSelector(state => state.items || [])`) causes a completely new array reference to be returned on every state dispatch, which triggers unnecessary React component re-renders even if `state.items` is logically unchanged (or empty).
**Action:** Always declare a stable `EMPTY_ARRAY` outside the component/hook and return that constant reference in `useSelector` when the source state is undefined or empty.
