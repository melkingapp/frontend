## 2024-05-24 - Removed Unused useSelector Subscription
**Learning:** Extracting unused state via useSelector in a list item creates an unnecessary subscription, causing O(n) re-renders across all items when the global state changes.
**Action:** Always ensure selected Redux state is actively consumed, or remove the subscription entirely.
