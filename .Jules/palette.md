## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Add ARIA Labels to Mobile Navigation Menus
**Learning:** Found several icon-only navigation buttons in header components, particularly for mobile layouts, that lacked `aria-label` attributes.
**Action:** Always verify icon-only interactive elements contain localized `aria-label` attributes, especially for navigation features like hamburger menus.
