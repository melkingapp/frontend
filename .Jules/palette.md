## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-07 - Accessible Floating Action Button (FAB) Menus in Persian Contexts
**Learning:** When building floating action buttons that toggle an action menu, the ARIA labels and titles must be dynamic ("باز کردن منو" for closed, "بستن منو" for open) to convey accurate state to Persian screen readers. Furthermore, the popup container requires `role="menu"` and its action items need `role="menuitem"` for proper structural context, alongside `aria-expanded` and `aria-haspopup="menu"` on the trigger.
**Action:** When creating expanding custom menus or FABs, always ensure the trigger conveys its state dynamically (both visually and semantically via ARIA), explicitly map ARIA roles for `menu` and `menuitem`, add `focus-visible` outlines, and hide decorative toggle icons using `aria-hidden="true"`.
