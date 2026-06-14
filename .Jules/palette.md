## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-06-14 - Accessible Mobile Menu Toggles
**Learning:** For accessible togglable overlays (e.g., Mobile Menus, Drawers, Dialogs) without native `<select>` tags, it's crucial to link the trigger button to the overlay. The button should have `aria-controls="[list-id]"` matching the overlay's ID, and its `aria-expanded` state must dynamically reflect whether the overlay is open (true/false).
**Action:** Always link mobile menu triggers to their respective `<Dialog>` or drawer components by matching `aria-controls` on the button with the `id` on the wrapper, and ensure `aria-expanded` is hooked to the visibility state.
