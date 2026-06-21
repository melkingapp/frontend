## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-21 - Keyboard Accessibility for Custom Tooltips on Icon Buttons
**Learning:** Custom tooltips that rely solely on `onMouseEnter` and `onMouseLeave` are completely inaccessible to keyboard-only users navigating via Tab. This is a common pattern for action icons in headers (like Public, Manager, and Resident headers).
**Action:** Always pair `onMouseEnter` and `onMouseLeave` with `onFocus` and `onBlur` event handlers. Ensure the element has explicit `focus-visible` styling (e.g., `focus-visible:ring-2 focus-visible:ring-melkingGold`) and a native `title` attribute as a fallback to ensure they are accessible and trackable for keyboard-only users.
