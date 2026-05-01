## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessibility improvements for Mobile Menu
**Learning:** Icon-only buttons (like the hamburger menu and desktop quick-action icons in navigation headers) often lack accessible names. Additionally, custom button mappings often lose standard keyboard focus indicators.
**Action:** Always add `aria-label` to icon-only interactive elements and enforce keyboard focus visibility using Tailwind's `focus:outline-none focus-visible:ring-2` to ensure the component is perceivable by both screen readers and keyboard users.
