## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-04-07 - Preventing Ghost Focus in Animated Menus
**Learning:** In components like `FloatingActionButton` that use CSS opacity and scale to hide menus (to preserve exit animations), setting `opacity: 0` does not remove elements from the tab order. This causes screen reader "ghost focus" issues where invisible items are focusable via keyboard navigation.
**Action:** When hiding custom menus without `display: none` or `visibility: hidden` (to allow CSS transitions), always combine `aria-hidden="true"` on the container with dynamically applying `tabIndex={open ? 0 : -1}` to all focusable children inside the menu to prevent keyboard accessibility issues.
