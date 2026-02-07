## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-19 - Keyboard Shortcut Hints in RTL
**Learning:** In RTL layouts (e.g., Persian), keyboard shortcuts like "Ctrl+K" can render incorrectly (e.g., "K+Ctrl") if the text direction isn't explicitly controlled.
**Action:** Always wrap keyboard shortcut hints in a container with `dir="ltr"` to ensure the key combination is displayed in the standard Left-to-Right order, regardless of the document's global direction.
