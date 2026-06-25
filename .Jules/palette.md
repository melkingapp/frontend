## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-25 - Accessible tooltips on icon buttons
**Learning:** Icon buttons that rely on hover events for custom tooltips are inaccessible to keyboard users unless paired with focus events.
**Action:** Always pair onMouseEnter/onMouseLeave with onFocus and onBlur event handlers, explicitly add focus-visible styling, and use a native title attribute as a fallback to ensure accessibility for keyboard-only users navigating via Tab.
