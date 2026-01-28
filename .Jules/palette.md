## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - RTL Search Input Patterns
**Learning:** In RTL interfaces (like Persian), the standard search input pattern places the Search icon at the start (Right) and the Clear/Action button at the end (Left). This mirrors the text direction (Right-to-Left).
**Action:** For RTL search inputs, position the Search icon on the Right (`right-3`) and the Clear button on the Left (`left-3`). Use corresponding padding (`pr` for search icon, `pl` for clear button) to prevent text overlap.
