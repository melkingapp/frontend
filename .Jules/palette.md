## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-27 - Accessible Floating Action Buttons
**Learning:** Icon-only floating action buttons require dynamic, localized aria-label and title attributes (e.g., 'باز کردن منو' / 'بستن منو') and aria-expanded state to provide essential context to screen readers, along with visible focus rings for keyboard navigation.
**Action:** Always include localized aria-label, title, and focus-visible utility classes on interactive UI elements lacking text content.
