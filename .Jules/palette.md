## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-29 - Accessible Togglable Overlays
**Learning:** Icon-only buttons used as triggers for overlays (like Mobile Menus, Drawers, Dialogs) often lack clear descriptive labels and miss semantic connection to the content they control.
**Action:** For accessible togglable overlays, always ensure the trigger button has an appropriate `aria-label` (and `title` for tooltip), dynamically updates `aria-expanded` based on the overlay's open state, and explicitly links to the overlay using `aria-controls` matching the overlay's `id`. Additionally, provide standard keyboard focus utility classes (`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`).
