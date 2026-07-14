## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-03-02 - Accessible Icon-Only Buttons
**Learning:** Icon-only menu buttons without `aria-label` or `title` attributes are invisible to screen readers, and lacking focus rings hinders keyboard navigation.
**Action:** Always provide localized `aria-label` and `title` attributes and explicit focus states using utility classes for icon-only interactive elements.
