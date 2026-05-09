## 2024-05-09 - Memoize Derived Data to Prevent Main-Thread Blocking
**Learning:** Performing expensive array operations like `.filter()`, `.forEach()`, or `.sort()` on large datasets directly within a component's render function blocks the main thread during every re-render (even when the data itself hasn't changed, e.g. when other non-related state triggers a re-render).
**Action:** Always wrap these expensive derived data calculations in `useMemo` hooks, providing strict dependency arrays to ensure the computation only runs when the underlying data or filter conditions actually change.
