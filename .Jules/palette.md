## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-10 - Accessible Custom Tooltips
**Learning:** Custom tooltips on interactive elements like icon buttons that rely solely on hover events (`onMouseEnter`/`onMouseLeave`) are completely inaccessible to keyboard-only users who navigate via Tab.
**Action:** Always pair hover event handlers with `onFocus` and `onBlur` for keyboard users, explicitly add visible focus styling (e.g., `focus-visible:ring-2`), and include a native `title` attribute as a fallback.
