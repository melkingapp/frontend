## 2024-05-20 - Memoization in Render Loop
**Learning:** Performance anti-pattern found in `UnitBase.jsx`: expensive unit grouping logic was executed inside an IIFE within the render return statement, causing recalculation on every render.
**Action:** Extracted the logic into a `useMemo` hook at the top level of the component to cache the result based on dependencies (`displayedUnits`).
