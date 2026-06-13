## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-28 - Immediate Error Announcement via `role="alert"`
**Learning:** While `aria-describedby` links errors to inputs, dynamically added error messages aren't always announced immediately by screen readers. Adding `role="alert"` to the error message container forces screen readers to announce the error as soon as it appears in the DOM.
**Action:** Always set `role="alert"` on form error message components to ensure immediate feedback for screen reader users when validation fails.
