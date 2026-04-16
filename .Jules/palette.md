## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessibility improvements for Header and Menus
**Learning:** Icon-only buttons (like hamburger menus or close buttons) frequently lack proper ARIA labels and focus states, hindering accessibility for screen readers and keyboard users. Proper `aria-label`, `title`, and `focus-visible` classes are necessary.
**Action:** Always verify that icon-only buttons have localized `aria-label` and `title` attributes (e.g., 'باز کردن منو' for Open Menu). Rely on existing utility classes (like `focus-visible:ring-2` for focus states) without adding custom CSS.
