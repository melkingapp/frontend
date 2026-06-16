## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-06-16 - Add role="alert" to ErrorMessage

**Learning:** Error messages in custom input components (e.g. `InputField`, `SelectField`, `RadioGroup`, `CheckboxGroup`) were not being announced by screen readers when they appeared. Screen readers do not automatically announce text that appears on the screen unless it has an appropriate ARIA role.
**Action:** Always add `role="alert"` to the container of dynamically rendered error messages to ensure that screen readers announce the text immediately as it is added to the DOM.
