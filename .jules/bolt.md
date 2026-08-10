## 2025-02-17 - React.memo() on list items and lists
**Learning:** Wrapping list items and their immediate list container components with React.memo() significantly reduces unnecessary re-renders in large lists when the parent components update their state.
**Action:** When working on lists that might render a large amount of items, ensure to apply React.memo to the row item component and the list itself.
