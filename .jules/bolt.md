## 2024-05-18 - [Memoizing Expensive Array Operations in Render]
**Learning:** Found an expensive array operation (`filter`, `group`, `sort`) computing derived state (`uniqueRequests`) inside the render phase of `BuildingRequestStatus.jsx` without memoization. This can cause main thread blocking during frequent re-renders as the list of requests grows.
**Action:** Wrapped the calculation in `useMemo` so it only recalculates when the dependencies (`requests`) change, significantly improving render performance.
