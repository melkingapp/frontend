## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-09-23 - Keyboard Accessibility for Custom Tooltips
**Learning:** Custom tooltips that appear on mouse hover (onMouseEnter/onMouseLeave) are inaccessible to keyboard users unless explicitly paired with onFocus and onBlur events. Screen reader users can rely on aria-label, but sighted keyboard users miss the visual tooltip context without these focus events.
**Action:** Always pair onMouseEnter with onFocus and onMouseLeave with onBlur when implementing custom tooltips, and ensure interactive elements have a visible focus ring using utility classes like focus-visible:ring-2.
