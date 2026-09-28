## 2024-05-24 - Extracted Nested React Components
**Learning:** Defining React components inside other components is a major anti-pattern that forces React to destroy and recreate DOM nodes on every parent render, which is an O(n) penalty for list items.
**Action:** Always define components outside of their parents and pass necessary data down via props.
