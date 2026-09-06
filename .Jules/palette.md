## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-15 - Accessibility improvements for Mobile Menu Buttons
**Learning:** Icon-only buttons frequently lack adequate accessibility descriptors (like `aria-label` and `title`) and visible keyboard focus states (like `focus-visible`), which makes navigation difficult for screen readers and keyboard users.
**Action:** Always ensure icon-only buttons include descriptive `aria-label` and `title` attributes, properly manage state (e.g., `aria-expanded`), and have distinct keyboard focus indicators (`focus-visible`).
