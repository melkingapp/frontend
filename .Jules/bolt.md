## 2024-05-24 - Unused Redux State in List Items
**Learning:** Extracting unused global state (like a `loading` flag) via `useSelector` inside list item components creates unnecessary subscriptions. This anti-pattern forces React to re-render every single list item when that global state changes, resulting in an O(n) re-render bottleneck.
**Action:** Always ensure that any state extracted by `useSelector` is strictly required for the component's render output or internal logic. If it's unused, remove it to prevent widespread, unnecessary re-renders.
