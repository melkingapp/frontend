## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-06-18 - Header accessibility and tooltips
**Learning:** When using custom tooltips on interactive elements (like icon buttons) that rely on hover events (`onMouseEnter`/`onMouseLeave`), they are not accessible to keyboard-only users navigating via Tab. Furthermore, mobile overlays need to be explicitly linked to their trigger buttons.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` event handlers and explicit `focus-visible` styling. For fallback, add a native `title` attribute. For overlays, use `aria-expanded` and `aria-controls` on the trigger button, and add a matching `id` on the overlay.
