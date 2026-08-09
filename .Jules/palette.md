## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - File Upload Keyboard Accessibility
**Learning:** Custom file upload zones often break keyboard accessibility by completely hiding the underlying `<input type="file">`. Buttons that appear only on parent hover (`group-hover:opacity-100`) become invisible traps for keyboard users.
**Action:** Always wrap `sr-only` file inputs inside their visual label and use `focus-within` on the label to style focus states. For reveal-on-hover actions, ensure they have equivalent `focus:opacity-100` styles so they become visible when navigated via keyboard.
