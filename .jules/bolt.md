## 2024-05-21 - Memoizing Derived State in Sidebars
**Learning:** Found that complex grouping and filtering operations (like those calculating unit structures and user roles from arrays) were being performed on every render via IIFEs or inline functions in the sidebar component.
**Action:** Wrapped expensive derived state calculations in `useMemo` hooks, specifically keeping the shape of complex calculations like `approvedUnits` intact while maintaining referential equality to avoid unnecessary re-evaluations of `useEffect` hooks relying on them as dependencies.
