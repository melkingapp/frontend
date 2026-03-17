## 2024-05-24 - [Optimize Resident Expenses Filtering]
**Learning:** React re-renders caused by unrelated state updates (e.g., `paymentModalOpen`, `isLoading`) can trigger expensive array operations (`filter`, `sort`) if they are left inline within the component body.
**Action:** Consistently identify and wrap derived data calculations that use `.filter()`, `.sort()`, or `.reduce()` in `useMemo` hooks to prevent main-thread blocking during re-renders. Also, remove unused `useSelector` subscriptions to prevent pointless re-renders when unrelated Redux state changes.
