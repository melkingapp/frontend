## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-09-24 - Keyboard Accessibility for Hover Tooltips
**Learning:** Custom tooltips triggered by onMouseEnter/onMouseLeave are inaccessible to keyboard users unless paired with onFocus/onBlur. Interactive elements also frequently lack visible focus indicators.
**Action:** Always pair mouse hover events with focus events for custom tooltips, and consistently apply focus-visible utility classes (e.g., focus-visible:ring-[#D3B66C]) to ensure keyboard navigation is accessible.
