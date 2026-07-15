## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-15 - Missing Accessibility Attributes on Header Icon Buttons
**Learning:** Icon-only buttons in the public header lacked consistent localized `title` attributes and focus rings, hurting both screen reader users and keyboard navigators.
**Action:** Always ensure icon-only buttons receive a localized `aria-label`, a `title` attribute, and standard keyboard focus states.
