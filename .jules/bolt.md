## 2026-10-22 - Optimize List Items
**Learning:** Extracting unused state via useSelector creates a subscription that causes widespread O(n) re-renders across all list items. Static arrays/objects should also be moved outside component functions to avoid unnecessary memory allocation and object recreation on every render cycle.
**Action:** Always verify useSelector variables are actually consumed in list item components, and move static configuration data structures outside the component body.
