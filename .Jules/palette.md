## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-07-09 - [Title: Icon-only Button Accessibility]
**Learning:** Icon-only buttons often lack accessible names, causing screen readers to read the icon name or nothing at all, which is confusing for users relying on assistive technologies in Persian contexts.
**Action:** Always add localized `aria-label` and `title` attributes (e.g. 'باز کردن منو') and visible focus styles (like `focus:outline-none focus-visible:ring-2 focus-visible:ring-melkingGold`) to icon-only buttons using existing utility classes to ensure accessibility and clear keyboard navigation feedback.
