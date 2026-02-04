## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-12 - Floating Action Button Accessibility
**Learning:** Icon-only FABs create significant accessibility traps if missing `aria-label` and `aria-expanded`. Hidden menu items in FABs must be removed from the tab order (`tabIndex="-1"`) when closed, otherwise keyboard users get stuck focusing on invisible elements.
**Action:** For all expandable menus, implement dynamic `tabIndex` management for items and verify keyboard navigation with tests.
