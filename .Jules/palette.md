## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-04-22 - Ghost Focus on Dynamically Hidden Elements
**Learning:** When using CSS transitions like opacity or scale to hide elements (e.g., in a dropdown menu or floating action button), the elements are still technically in the DOM and part of the tab order, leading to a confusing 'ghost focus' experience for keyboard users where focus disappears into invisible elements.
**Action:** Always conditionally apply `tabIndex={-1}` and `aria-hidden="true"` to focusable elements when they are visually hidden to remove them from the tab sequence, and restore `tabIndex={0}` when they are visible.
