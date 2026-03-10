## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2026-03-10 - [Accessible Floating Action Button Menu]
**Learning:** Adding standard ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-controls`) and proper `role` (`menu`, `menuitem`) to custom dropdown menus makes them significantly more usable for screen readers, and adding `focus-visible` ensures keyboard navigation is clearly visible without impacting mouse users.
**Action:** Always include ARIA relations between a trigger button and its menu, and ensure all interactive elements have visible focus states.
