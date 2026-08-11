## 2024-08-11 - Optimize List Rendering in React
**Learning:** When rendering long lists of components (e.g., `FinanceTableRow`), passing complex objects without memoization causes unnecessary re-renders. A custom equality function might inadvertently cause stale UI state if it omits necessary fields (like `date` or `category`). Standard `React.memo()` provides safer shallow comparison when props are properly handled by the parent.
**Action:** Use `React.memo()` without a custom equality function unless strictly necessary, and ensure all dependent fields are checked to prevent stale UI bugs.
