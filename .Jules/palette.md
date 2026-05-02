## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessibility improvements for Custom Group Inputs (CheckboxGroup / RadioGroup)
**Learning:** For custom group inputs, using standard `<fieldset>` and `<legend>` tags can introduce unintended visual regressions with existing Tailwind CSS borders. Instead, applying `role="group"` to a container `<div>` and linking it to a paragraph using React's `useId()` and `aria-labelledby` provides proper semantic grouping for screen readers without breaking the visual design.
**Action:** Always use `role="group"` and `aria-labelledby` combined with `useId()` when grouping multiple related checkboxes or radio buttons to maintain both accessibility and visual consistency.
