## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-09-21 - Add keyboard accessibility for hover-based tooltips
**Learning:** Hover-based tooltips on icon buttons often lack keyboard accessibility because they only respond to mouse events. They need onFocus and onBlur handlers to be accessible via keyboard navigation.
**Action:** Always add onFocus and onBlur handlers whenever onMouseEnter and onMouseLeave are used for tooltips. Ensure interactive elements also have a visible focus ring.
