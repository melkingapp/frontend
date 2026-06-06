## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-06 - Accessible Custom Tooltips
**Learning:** Custom tooltips that rely solely on `onMouseEnter` and `onMouseLeave` are completely inaccessible to keyboard-only users who navigate via Tab.
**Action:** For accessible custom tooltips on interactive elements, always pair hover events with `onFocus` and `onBlur` event handlers and explicit `focus-visible` styling (e.g., `focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) to ensure they are visible and trackable for keyboard-only users.
