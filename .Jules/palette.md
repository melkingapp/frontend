## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessibility improvements for icon-only buttons
**Learning:** Custom tooltips built with `onMouseEnter` and `onMouseLeave` are completely inaccessible to keyboard users navigating via Tab. Furthermore, without explicit focus styling, keyboard users lose track of their position on icon rows.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur`, add explicit `focus-visible` styling (e.g. `focus-visible:ring-2 focus-visible:ring-[#D3B66C]`), and provide a native `title` attribute as a fallback for screen readers and native browser tooltips.
