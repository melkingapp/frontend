## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-14 - Keyboard Shortcuts in RTL Inputs
**Learning:** When adding keyboard shortcut badges (e.g., "Ctrl+K") inside inputs in an RTL layout, use `dir="ltr"` on the badge container to preserve the key combination text order (e.g., "Ctrl+K" instead of "K+Ctrl"). Ensure sufficient padding (`pl` or `pr` depending on icon placement) is reserved to prevent text overlap.
**Action:** Use `dir="ltr"` for technical text/shortcuts within RTL interfaces and verify spacing with long input values.
