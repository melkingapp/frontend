## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-28 - ARIA Grouping for Custom Inputs
**Learning:** When building custom `CheckboxGroup` or `RadioGroup` components using `div` containers (instead of `fieldset`/`legend` which cause visual regressions with Tailwind borders), screen readers lose the grouping context. Also, inline error messages need `role="alert"` so they are announced correctly upon form validation failures.
**Action:** Always add `role="group"` (or `role="radiogroup"`) to the container `div`, link it to the custom label using `aria-labelledby` paired with `useId()`, and ensure error message containers use `role="alert"`.
