## 2026-10-02 - Optimize list items Redux selectors
**Learning:** Selecting an entire state slice object (like `state.payments`) in a list item component causes widespread, O(n) re-renders across all list items whenever any unrelated data in that slice updates.
**Action:** Always select specific primitive values (e.g., `state.payments.loading`) to prevent unnecessary re-renders and ensure optimizations like `React.memo` remain effective.
