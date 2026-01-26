## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-25 - RTL Search Input Patterns
**Learning:** In RTL interfaces (like Persian), the standard LTR search pattern (Icon Left, Clear Right) should be mirrored: Search Icon on the Right (Start) and Clear Button on the Left (End). This matches the natural reading direction and prevents the icon from visually clashing with the start of the typed text.
**Action:** When styling inputs for RTL, explicitly position icons using `right-` for start icons and `left-` for end/action icons, or use logical properties if supported by the stack.
