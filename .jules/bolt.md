## 2024-10-27 - Optimizing arrays in render logic
**Learning:** In list item components that render arrays on every iteration (e.g. `avatarColors` inside `PaymentItem`), defining static arrays inside the component causes unnecessary memory allocations and garbage collection pressure when lists are long.
**Action:** Move static data arrays and configuration objects outside the React component function to allocate them exactly once.
