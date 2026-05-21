## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-21 - Accessible Form Error Associations
**Learning:** For custom form inputs, validation errors and help text are often visually close to the input but not programmatically linked. Screen readers won't announce the error when the input is focused unless explicitly linked.
**Action:** Always dynamically construct an `aria-describedby` string that links the `id` of both the error message and the help text to the `input`. Filter out missing values (e.g. `[errorId, helpTextId].filter(Boolean).join(' ')`) to avoid dangling references, and use `aria-invalid` on the input.
