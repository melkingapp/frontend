## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-09-13 - Add a11y attributes to icon-only buttons
**Learning:** Icon-only buttons frequently lack 'aria-label' or 'title' which impacts screen reader users, and missing 'aria-expanded' hurts state awareness. Missing focus rings hinder keyboard navigation.
**Action:** Always ensure icon-only buttons have localized 'aria-label', 'title', state indicators like 'aria-expanded', and visible focus styles (e.g., focus-visible:ring-2).
