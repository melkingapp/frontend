## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-09-20 - Custom Tooltip Keyboard Accessibility
**Learning:** Custom tooltips built with `onMouseEnter` and `onMouseLeave` are completely invisible to keyboard navigation users. This is a common pattern in the codebase for icon-only buttons.
**Action:** Always pair hover event handlers with `onFocus` and `onBlur` handlers, and add `focus-visible` styles to ensure these tooltips are accessible and apparent to keyboard users.
