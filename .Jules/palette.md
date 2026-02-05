## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-25 - SearchBox RTL & Shortcuts
**Learning:** For RTL search inputs, placing the icon on the Right (Start) and Clear button on the Left (End) feels most natural. `Ctrl+K` is a delightful standard, but implementing it requires handling both `ctrlKey` and `metaKey` (Mac).
**Action:** Use `pr-10` and `pl-10` for inputs with start/end icons in RTL. Always check `e.metaKey || e.ctrlKey` for shortcuts.
