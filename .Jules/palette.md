## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessible custom group inputs while preserving Tailwind styles
**Learning:** Using `<fieldset>` and `<legend>` for grouped inputs (like CheckboxGroup or RadioGroup) introduces visual regressions with existing Tailwind styles (e.g., overlapping borders).
**Action:** Use a `<div>` with `role="group"`, link it to a label paragraph using `aria-labelledby` with `useId()`, and add focus ring states to the inner native inputs to provide proper semantics for screen readers and keyboard accessibility while preserving complex Tailwind structures.
