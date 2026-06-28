## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-23 - Mobile Menu Accessibility
**Learning:** For accessible togglable overlays (e.g., Mobile Menus, Drawers, Dialogs), always link the trigger button to the overlay by setting `aria-controls` on the button to match the overlay's `id`, and dynamically update the button's `aria-expanded` state (true/false) to reflect the overlay's visibility. In Persian context, localized `aria-label` and `title` like 'باز کردن منو' and 'بستن منو' should be used.
**Action:** Always add `aria-expanded`, `aria-controls`, and localized `aria-label`/`title` to overlay trigger buttons, and ensure focus visible states use standard rings like `focus-visible:ring-melkingGold`.
