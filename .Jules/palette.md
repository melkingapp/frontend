## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2023-10-24 - Accessible Overlay Triggers
**Learning:** Linking trigger buttons to togglable overlays with aria-controls and dynamically updating aria-expanded improves screen reader context.
**Action:** Always ensure icon-only toggle buttons have localized aria-label, title, aria-controls matching overlay id, and aria-expanded state.
