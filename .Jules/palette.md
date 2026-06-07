## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-27 - Improve custom group inputs accessibility
**Learning:** Custom group inputs (like CheckboxGroup/RadioGroup) should use `<div role="group">` with `aria-labelledby` to provide correct screen reader semantics without breaking existing Tailwind styles. Using `<fieldset>` and `<legend>` can introduce visual regressions.
**Action:** When creating or modifying custom group inputs, ensure they use `<div role="group">` and `aria-labelledby` linked to the group label using `useId()`. Also, add `role="alert"` to any error message components.
