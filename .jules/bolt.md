## 2026-05-04 - Memoized array operations
**Learning:** The unoptimized Array.prototype.sort operation can cause significant re-render latency in modals with long lists.
**Action:** Always wrap expensive Array operations (sort, filter, map) inside useMemo hooks to prevent unneeded re-evaluations during unrelated re-renders.
