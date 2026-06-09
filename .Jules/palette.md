## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-25 - Accessibility improvements for Icon-Only Buttons
**Learning:** Icon-only buttons used for toggling overlays (like mobile menus) require more than just an `aria-label`. They also need `aria-expanded` to communicate their current state, `aria-haspopup` to indicate what kind of overlay they trigger, and robust `focus-visible` styling (e.g., `focus:outline-none focus-visible:ring-2`) to support keyboard navigation.
**Action:** Always add `aria-expanded`, `aria-haspopup`, and `focus-visible` styles when dealing with custom overlay trigger buttons.
