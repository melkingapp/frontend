## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-05-20 - RTL Keyboard Hints
**Learning:** In RTL layouts (Persian), keyboard shortcuts (e.g., "Ctrl K") can be rendered as "K Ctrl" if the container direction is not forced.
**Action:** Always wrap keyboard shortcut hints in a container with `dir="ltr"` to preserve the correct key order, regardless of the application's global direction.
