## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2026-04-19 - Accessible Custom Group Inputs
**Learning:** For custom group inputs (like CheckboxGroup or RadioGroup), using `<fieldset>` and `<legend>` can introduce visual regressions (like overlapping borders) with existing Tailwind styles. A `<div>` with `role="group"` linked to the label using `aria-labelledby` and React's `useId()` provides the exact same semantics for screen readers without breaking layouts. Additionally, when using `forwardRef` with an array of inputs, applying the ref to only the first input (`ref={index === 0 ? ref : null}`) correctly enables focus management for libraries like `react-hook-form`.
**Action:** Use `<div role="group" aria-labelledby={id}>` instead of fieldsets for custom grouped inputs to avoid styling conflicts, and conditionally forward refs on loop-mapped form elements.
