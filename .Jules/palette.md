## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessibility improvements for Checkbox and Radio Groups
**Learning:** When building custom `CheckboxGroup` or `RadioGroup` components using standard `div` tags, setting `role="group"` combined with `aria-labelledby` ensures screen readers announce the group's name when a user tabs into it. Passing unique IDs with `useId()` and linking errors with `aria-describedby` provides immediate audio feedback on form invalidation without relying on visual cues.
**Action:** Always wrap custom group inputs in a `role="group"` container and use unique IDs to associate labels and error messages.
