## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessibility improvements for Icon-Only Buttons
**Learning:** Added `aria-label`, `title`, and `focus-visible` to icon-only buttons improves screen reader and keyboard accessibility. Use native language translations (e.g. Persian).
**Action:** Always wrap icon-only buttons with `aria-label`, `title` attributes, and `focus-visible:ring-2` to ensure proper accessibility and keyboard navigation.
