## 2026-05-04 - Memoized array operations
**Learning:** The unoptimized Array.prototype.sort operation can cause significant re-render latency in modals with long lists.
**Action:** Always wrap expensive Array operations (sort, filter, map) inside useMemo hooks to prevent unneeded re-evaluations during unrelated re-renders.
## 2026-05-04 - Migrate GitHub Actions to pnpm
**Learning:** The CI pipeline was still using npm despite the codebase moving to pnpm. This caused a synchronization error with package-lock.json vs pnpm-lock.yaml during npm ci.
**Action:** When encountering npm ci sync errors in a pnpm repository, ensure the workflow is fully migrated to use pnpm (setup action, cache, and commands) to leverage the correct lockfile.
## 2026-05-04 - Clsx polyfill in React Component
**Learning:** Naive regex replacement of clsx and its import with an inline polyfill can lead to 'SyntaxError: Identifier has already been declared' if the component is imported multiple times or if the polyfill is placed in a way that causes scope issues in ES modules/vite. Also removing a library might break the build if other files import it without checking.
**Action:** It is safer to re-install missing UI utility libraries like `clsx` using the authorized package manager (e.g. `pnpm add clsx`) rather than trying to globally polyfill it, unless specifically instructed otherwise.
