## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-10-01 - Enhance Icon-Only Accessibility
**Learning:** Icon-only buttons frequently lack localized `aria-label`, `title` attributes, and clear focus states, which are critical for keyboard and screen reader users in this app's components.
**Action:** Always ensure icon-only buttons include comprehensive accessibility attributes (`aria-label`, `title`) and rely on the standard `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]` utility classes for keyboard accessibility.
