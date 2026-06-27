## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-11-09 - Accessible Togglable Overlays in Floating Components
**Learning:** Floating components like `FloatingActionButton` lack `aria-expanded` and `aria-controls` linkage between the trigger button and the popup menu, causing screen readers to miss context about the menu's state and location.
**Action:** Always link togglable overlay triggers to their content using `aria-controls` (matching the overlay's ID) and dynamically update `aria-expanded` on the trigger based on visibility state. Add localized `aria-label` and `title` for icon-only triggers and focus-visible rings for keyboard users.
