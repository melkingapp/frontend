## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-15 - Missing aria-label on Mobile Menu Button in Header
**Learning:** The public header's mobile menu toggle button lacks an aria-label, making it inaccessible for screen reader users trying to open the navigation menu.
**Action:** Always ensure icon-only buttons (like a hamburger menu `<Menu />`) include a localized `aria-label` (e.g., "باز کردن منو" for Persian contexts) for accessibility.
