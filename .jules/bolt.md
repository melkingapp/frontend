## 2026-09-16 - Unnecessary Global State Selection in List Items
**Learning:** Selecting global slice state (like `loading`) inside mapped list item components causes widespread O(n) re-renders for all items whenever that state updates, even if the value is unused by the component.
**Action:** Always verify if a selected Redux state is actually consumed by the list item, and hoist shared loading states to the parent list component to prevent cascading re-renders.
