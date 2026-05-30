## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-30 - Keyboard Accessibility and State for Toggles
**Learning:** Icon-only buttons used for toggling overlays (like Mobile Menus) often miss critical accessibility attributes. Adding `aria-expanded` reflecting the state dynamically is crucial for screen readers. Furthermore, ensuring standard focus rings (`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) are present allows for clear keyboard navigation.
**Action:** Always ensure toggle buttons (especially icon-only ones) have `aria-label`, dynamic `aria-expanded` state, and consistent focus rings using Tailwind's `focus-visible` classes.
