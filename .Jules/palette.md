## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-04-27 - Prevent Ghost Focus in Opacity Exit Animations
**Learning:** When using opacity and pointer-events (instead of standard classes like Tailwind's `invisible`) for exit animations on custom components like FloatingActionButton, screen readers and keyboard navigation (Tab key) can still interact with the 'hidden' elements because they remain in the document flow and tab order.
**Action:** For focusable elements within these custom hidden menus, dynamically set `tabIndex={-1}` when the menu is hidden, and use `aria-hidden='true'` on the container.
