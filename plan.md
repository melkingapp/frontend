1.  **Refactor `useSelector` in `PaymentItem` Components**
    -   In `src/features/manager/finance/components/payments/PaymentItem/PaymentItem.jsx` and `src/features/manager/unitManagement/components/payments/PaymentItem.jsx`, the component currently extracts the `loading` variable from Redux state with `const { loading } = useSelector(state => state.payments);`. However, `loading` is never used in the component, and it subscribes to the entire `state.payments` object, leading to re-renders on every payment state change.
    -   I will use `replace_with_git_merge_diff` to remove the unused `useSelector` line from both files to prevent these unnecessary re-renders.

2.  **Refactor `useSelector` in `RequestItem` Component**
    -   In `src/features/manager/unitManagement/components/requests/RequestItem.jsx`, there are multiple `useSelector` calls extracting states such as `selectedBuildingId`, `data: buildings`, and `user`. Extracting entire objects like `state.building` and `state.auth` causes O(n) re-renders across all list items whenever any unrelated property in those slices changes.
    -   I will use `replace_with_git_merge_diff` to select only the specific primitive values needed (e.g., `state => state.building.selectedBuildingId`, `state => state.building.data`, `state => state.auth.user`) to optimize rendering performance.

3.  **Journal Learning**
    -   I will document this performance learning specific to optimizing Redux `useSelector` in list items in `.Jules/bolt.md`.
    -   Command: `mkdir -p .Jules && echo -e "## $(date +%Y-%m-%d) - Optimize Redux useSelector in List Items\n**Learning:** Selecting entire Redux slice objects (e.g., \`useSelector(state => state.payments)\`) in list items creates unnecessary subscriptions. When any property in the slice updates (like a global loading state), it triggers O(n) re-renders across all list components, even if they don't consume the updated data or extract unused variables.\n**Action:** Always select specific, minimal properties needed by the component (e.g., \`useSelector(state => state.payments.loading)\`) or completely remove unused \`useSelector\` calls in list item components to preserve performance and ensure \`React.memo\` remains effective." >> .Jules/bolt.md`

4.  **Local Validation**
    -   Run linting and tests to ensure no regressions were introduced.
    -   Command: `pnpm lint | grep -E 'PaymentItem\.jsx|RequestItem\.jsx' || true && pnpm test || true`

5.  **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**

6.  **Submit Pull Request**
    -   Submit the optimized code as a PR with title "⚡ Bolt: [performance improvement]" and details outlining the reduction of unnecessary re-renders in list items.
