## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-09-28 - ARIA attributes for Menu Toggles
**Learning:** Navigation menus require both `aria-label` for screen readers and `aria-expanded` for communicating state. The focus ring should also match the app's visual style.
**Action:** Always add `aria-label` and `aria-expanded` to menu toggle buttons, and use `focus-visible:ring-2 focus-visible:ring-[#D3B66C]` to maintain visual focus consistency.
