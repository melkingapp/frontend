## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-09-27 - Mobile Menu Accessibility
**Learning:** Icon-only toggle buttons (like mobile hamburger menus) often lack proper accessibility attributes and visible focus states by default.
**Action:** Always add localized `aria-label`, `aria-expanded` state, and consistent application-specific focus rings (`focus-visible:ring-[#D3B66C]`) to icon-only toggle buttons.
