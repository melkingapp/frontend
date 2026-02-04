## 2024-05-23 - Test Infrastructure & cleanup
**Learning:** When working on a codebase with broken or inconsistent test configuration (mixed ESM/CJS), do not commit fixes to the infrastructure (like `jest.config.cjs`, `babel.config.js`) unless explicitly asked. These changes are considered "invasive" and "scope creep".
**Action:** Create temporary test files and configuration fixes to verify your work locally, but **revert all of them** before submitting the PR. Only submit the core code changes (and new tests if they don't require config changes).

## 2024-05-23 - Performance Optimization
**Learning:** `useMemo` is effective for preventing expensive re-calculation of derived data (filtering, grouping) in React components, especially when the logic runs on every render and involves array iterations.
**Action:** Look for IIFEs or complex logic directly in the render body and extract them into `useMemo` hooks.
