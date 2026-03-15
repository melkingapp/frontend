## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessibility improvements for Icon-Only Buttons
**Learning:** Adding `aria-label` to buttons without text content (e.g., icons) is crucial for screen readers to understand their purpose. This is especially important for actions like clearing a file, viewing a document, downloading, or deleting.
**Action:** Always add localized `aria-label`s to icon-only buttons to ensure keyboard accessibility and screen reader support.
