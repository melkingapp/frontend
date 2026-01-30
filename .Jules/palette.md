## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-25 - Floating Action Button Accessibility
**Learning:** `opacity-0` and `pointer-events-none` are insufficient for hiding elements from keyboard navigation and screen readers; elements remain in the accessibility tree and tab order. `aria-hidden="true"` and `tabIndex="-1"` (or `display: none`/`visibility: hidden`) are required to properly remove them.
**Action:** Always manage `tabIndex` and `aria-hidden` state for custom dropdowns or menus that rely on CSS transitions for visibility.
