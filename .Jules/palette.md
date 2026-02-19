## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-25 - RTL Input Adornments & Shortcuts
**Learning:** When adding keyboard shortcuts to RTL inputs with start/end adornments, carefully consider the visual flow. Placing the shortcut hint next to the search icon (at the 'end' / left) works well when the text input is right-aligned, avoiding overlap.
**Action:** Always verify bidirectional (LTR/RTL) implications of absolute positioning for input adornments.
