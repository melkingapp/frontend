## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-05-24 - Search Input Layout in RTL
**Learning:** In this RTL application, the `SearchBox` component positions its icon physically at the `Left` (End of text flow), deviating from the standard "Start" (Right) placement.
**Action:** When adding adornments like keyboard shortcut hints to inputs, respect the existing physical positioning (Left/End) to maintain visual consistency and avoid overlapping with Right-aligned text.
