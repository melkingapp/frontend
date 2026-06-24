## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-21 - Accessible interactive buttons with tooltips
**Learning:** For accessible custom tooltips on interactive elements (like icon buttons) that rely on hover events (`onMouseEnter`/`onMouseLeave`), always pair them with `onFocus` and `onBlur` event handlers, explicit `focus-visible` styling (e.g., `focus-visible:ring-2 focus:outline-none`), and a native `title` attribute as a fallback to ensure they are accessible and trackable for keyboard-only users navigating via Tab.
**Action:** Always ensure that any button triggering a tooltip via hover has matching focus events and clear `focus-visible` states.
