## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessibility improvements for Mobile Menu
**Learning:** The mobile menu toggle button in `src/shared/components/headers/publicHeader/Header.jsx` is missing an `aria-label` or `aria-expanded` attributes, preventing screen readers from accurately understanding its purpose.
**Action:** Always add an `aria-label` to icon-only buttons, specifically for mobile menu toggles like `باز کردن منو` (Open Menu in Persian).
