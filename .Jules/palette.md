## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-06-03 - Semantic Roles for Custom Group Inputs
**Learning:** Using simple `<div>` elements for custom radio or checkbox groups causes screen readers to lose context, making it difficult for users to understand what the options belong to. While `<fieldset>` and `<legend>` are standard, they sometimes cause visual regressions (like overlapping borders) with existing Tailwind styles.
**Action:** When building custom group inputs (like CheckboxGroup or RadioGroup), use a `<div>` with `role="group"` and link it to the group label using `aria-labelledby` and React's `useId()`. This provides proper semantic grouping for screen readers without breaking the visual design. Always add `role="alert"` to error messages and `aria-invalid` to the inputs.
