## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Icon-only Mobile Menu Button Accessibility
**Learning:** The main mobile menu toggle button lacked accessibility attributes (`aria-label`, `aria-expanded`) and visible keyboard focus states, a common pattern with Lucide icon-only buttons in this app.
**Action:** Always ensure state-toggling icon-only buttons have localized `aria-label` and `title` attributes, use `aria-expanded` to communicate state, and apply `focus-visible` utility classes to maintain keyboard accessibility.
