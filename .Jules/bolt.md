## 2026-10-26 - Move Static Arrays Out of Components
**Learning:** In list item components like `PaymentItem` and `RequestItem`, static arrays like `avatarColors` are repeatedly declared inside the component body, which unnecessarily allocates memory on every single render cycle for each item in the list.
**Action:** Move static data structures and config objects outside the component function body to prevent unnecessary recreation during render cycles.
