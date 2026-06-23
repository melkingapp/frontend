## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2026-06-23 - Custom tooltips accessibility in headers
**Learning:** Custom tooltips that rely solely on `onMouseEnter`/`onMouseLeave` break accessibility for keyboard-only users who navigate via Tab.
**Action:** Always pair them with `onFocus` and `onBlur` event handlers, explicit `focus-visible` styling (e.g., `focus-visible:ring-2`), and a native `title` attribute as a fallback to ensure they are accessible and trackable.
