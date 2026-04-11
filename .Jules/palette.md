## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-15 - [Accessibility for Floating Action Buttons]
**Learning:** Using `opacity-0` and `scale-90` to hide dropdown menus visually does not remove them from the document flow or the focus order. This causes "ghost focus" issues for keyboard users where they are tabbing into invisible elements.
**Action:** Always combine opacity-based exit animations with `pointer-events-none`, `aria-hidden="true"`, and dynamically apply `tabIndex={-1}` to focusable children inside the hidden menu.
