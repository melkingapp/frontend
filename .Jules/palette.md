## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-30 - Accessible Date Picker Navigation
**Learning:** Custom date pickers often miss localization on icon-only navigation buttons and state indication on the trigger.
**Action:** Always add localized `aria-label` and `title` to custom date picker navigation buttons and `aria-expanded` to the trigger.
