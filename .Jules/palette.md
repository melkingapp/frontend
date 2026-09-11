## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-09-11 - Accessibility for icon-only mobile menu buttons
**Learning:** Icon-only buttons used for critical navigation tasks like mobile menus often lack accessible names (`aria-label`) and visible focus indicators, hindering keyboard navigation and screen reader users.
**Action:** Always add localized `aria-label`, `title`, and visible focus rings (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) to icon-only interactive elements.
