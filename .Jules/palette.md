## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-09-29 - Accessible Header Menu
**Learning:** The public header's mobile menu button was missing a localized `aria-label`, `title`, explicit `aria-expanded` state, and visual keyboard focus indicators, degrading the accessibility for screen readers and keyboard navigation.
**Action:** Always ensure icon-only state-toggling buttons include `aria-label` and `title` in Persian (e.g., 'باز کردن منو'), use `aria-expanded`, and implement `focus-visible:ring-2 focus-visible:ring-[#D3B66C]` without custom CSS.
