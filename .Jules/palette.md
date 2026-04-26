## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-04-26 - Keyboard Navigation in Disclosure Menus
**Learning:** For custom dropdowns or disclosure menus (like FloatingActionButton) that toggle visibility using CSS opacity or scale animations, elements inside remain in the DOM. This causes a "ghost focus" issue where keyboard users can tab onto hidden, non-interactive elements.
**Action:** Always apply `tabIndex={open ? 0 : -1}` to focusable children inside animated hidden menus to explicitly remove them from the tab sequence when the menu is closed. Combine this with `aria-hidden={!open}` on the container and `aria-expanded` on the toggle button.
