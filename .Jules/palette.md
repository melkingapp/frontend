## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-01-07 - Button Loading State Visibility
**Learning:** Hardcoded spinner colors (e.g., `border-white`) become invisible on buttons with matching backgrounds (like white/outline variants).
**Action:** Use `border-current` for spinners to automatically inherit the button's text color, ensuring visibility on all variants (solid, outline, ghost).
