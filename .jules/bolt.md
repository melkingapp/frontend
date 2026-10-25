## 2026-10-25 - Extract static arrays from render loop
**Learning:** Recreating static arrays (like color palettes) inside list item components causes unnecessary memory allocation on every render.
**Action:** Always move static arrays, objects, or configuration data structures outside of the component function body, especially for list items.
