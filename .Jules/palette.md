## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-18 - Keyboard Accessible Icon Tooltips
**Learning:** Tooltips on interactive elements (like icon buttons) that rely solely on `onMouseEnter` and `onMouseLeave` are invisible to keyboard-only users navigating via Tab.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus` and `onBlur` event handlers on the trigger button, and add explicit `focus-visible` styling (e.g., `focus-visible:ring-2`) to ensure tooltips and focus states are visible and trackable for keyboard-only users.
