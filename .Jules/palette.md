## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-09-30 - Added Accessibility Attributes to Icon-only Buttons
**Learning:** Icon-only buttons used for state toggling (like menus) in this codebase often lack localized `aria-label`, `title`, and `aria-expanded` attributes, which impairs screen reader usability and keyboard navigation.
**Action:** Always verify icon-only buttons have localized `aria-label`/`title` and proper `aria-expanded` properties for state-toggling, while using existing utility classes like `focus-visible:ring-[#D3B66C]` to ensure keyboard accessibility.
