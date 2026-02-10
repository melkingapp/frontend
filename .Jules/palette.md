## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - SearchBox Keyboard Shortcut & RTL
**Learning:** When adding English keyboard hints (like "Ctrl+K") inside an RTL input field (e.g., Persian), wrap the hint in a container with `dir="ltr"` to prevent the browser from reordering "Ctrl" and "K" (e.g., displaying "K+Ctrl"). Also, position these "meta" controls (shortcuts, clear buttons) at the visual end (left side in RTL) to avoid interfering with the typing start point (right side).
**Action:** Use `dir="ltr"` for shortcut badges in RTL apps and group secondary actions at the visual end of inputs.
