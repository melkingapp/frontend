## 2026-10-23 - Unused Redux State in List Items
**Learning:** Subscribing to unused global state (like loading flags) in list item components causes unnecessary O(n) re-renders across all items whenever that state changes.
**Action:** Audit list components to remove unused useSelector state and move static configuration arrays (like avatarColors) outside of the component function to avoid recreation on every render.
