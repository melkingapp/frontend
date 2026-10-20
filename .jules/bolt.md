## 2024-10-20 - Extract Static Data Structures from Render Loops
**Learning:** Static arrays or object data structures defined inside a list item component cause memory re-allocation on every render, which becomes a bottleneck for lists.
**Action:** Move static arrays (like color palettes) and objects outside of the component body to avoid unnecessary allocations.
