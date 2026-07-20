## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-07-20 - Ensure interactive SVGs have accessible labels and focus states
**Learning:** Icon-only buttons (like the hamburger menu or close icon) often lack text equivalents (`aria-label`) and visible focus states, making them invisible to screen readers and difficult to navigate for keyboard users.
**Action:** When adding or auditing icon-only buttons, always ensure they have a localized `aria-label`, a descriptive `title`, and explicit focus styles (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`).
