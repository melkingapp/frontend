## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-21 - [Public Header Mobile Menu Accessibility]
**Learning:** Mobile menu toggle buttons in the public header were lacking basic accessibility attributes (`aria-label`, `title`) and keyboard focus indicators. The mobile side-drawer close button (`MobileMenu.jsx`) had proper accessibility, but the trigger in `Header.jsx` did not, breaking the keyboard navigation experience for users accessing the header menu.
**Action:** Always ensure icon-only buttons that trigger side-menus or overlays include localized `aria-label`s and `focus-visible` styles matching the repository focus indicators.
