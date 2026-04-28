## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessible animated dropdowns (FloatingActionButton)
**Learning:** When hiding custom dropdowns, avoiding `invisible` allows CSS exit animations (like opacity/scale) to finish. However, `opacity-0` and `pointer-events-none` do NOT remove elements from the browser's tab sequence, leading to "ghost focuses" on invisible items.
**Action:** Always combine `opacity-0` with `aria-hidden="true"` and explicitly set `tabIndex={-1}` dynamically on all focusable children when the dropdown is closed to ensure true keyboard accessibility. Toggle buttons also need dynamic localized `aria-label`s.
