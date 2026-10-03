## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-10-03 - Improve Header Navigation Accessibility
**Learning:** Found multiple header navigation components across public, resident, and manager views missing complete accessibility attributes (e.g. `title` on icon-only buttons, `aria-expanded` on toggle controls) and keyboard focus styles (`focus-visible:ring-2`).
**Action:** Add `title` and proper keyboard focus states (`focus:outline-none focus-visible:ring-2`) to all icon-only buttons to ensure they are accessible to screen readers and keyboard users.
