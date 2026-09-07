## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-09-07 - Accessibility for Mobile Menu Buttons
**Learning:** Icon-only buttons used for mobile menus often lack accessible names and visible focus indicators. Adding an `aria-label` and consistent focus ring styles (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) is crucial for keyboard and screen reader accessibility.
**Action:** Ensure all mobile-specific toggle buttons are equipped with localized `aria-label`s and visible focus states.
