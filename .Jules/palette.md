## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-31 - Accessibility improvements for Togglable Overlays
**Learning:** For icon-only interactive overlay triggers (like Floating Action Buttons), ensuring proper ARIA bindings is crucial for screen readers to understand the component's state and purpose. The button must have `aria-expanded` reflecting its open/closed state, and `aria-controls` linked to the overlay's ID to describe the relationship. Since it only contains an icon, `aria-label` and `title` (localized) are necessary to provide an accessible name, while the decorative icon itself should be hidden with `aria-hidden="true"`.
**Action:** Always link trigger buttons to their overlays using `useId()` and `aria-controls`, explicitly manage `aria-expanded` state, and provide localized `aria-label` and `title` for icon-only buttons.
