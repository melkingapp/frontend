## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Add accessible group semantics to custom form inputs
**Learning:** For custom group inputs like CheckboxGroup and RadioGroup, simply wrapping them in a div visually is insufficient for screen readers. Using `<fieldset>` and `<legend>` can introduce visual regressions. A `<div>` with `role="group"` and `aria-labelledby` linked to the label using `useId()` provides proper group semantics without styling conflicts. Also, ensuring inline error message components consistently have `role="alert"` allows screen readers to announce validation errors dynamically.
**Action:** When building custom groups (radio, checkbox), use `useId()` and `role="group"`. Add `role="alert"` for form validation messages.
