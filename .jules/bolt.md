## 2026-05-04 - Memoized array operations
**Learning:** The unoptimized Array.prototype.sort operation can cause significant re-render latency in modals with long lists.
**Action:** Always wrap expensive Array operations (sort, filter, map) inside useMemo hooks to prevent unneeded re-evaluations during unrelated re-renders.
## 2026-05-04 - Migrate GitHub Actions to pnpm
**Learning:** The CI pipeline was still using npm despite the codebase moving to pnpm. This caused a synchronization error with package-lock.json vs pnpm-lock.yaml during npm ci.
**Action:** When encountering npm ci sync errors in a pnpm repository, ensure the workflow is fully migrated to use pnpm (setup action, cache, and commands) to leverage the correct lockfile.
