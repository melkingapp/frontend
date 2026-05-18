## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessibility for Floating Action Buttons
**Learning:** Expanding/collapsing action buttons need clear state indicators (`aria-expanded`) and context-aware localized labels (e.g., "باز کردن منو" / "بستن منو" in Persian). Decorative icons inside them must be hidden with `aria-hidden="true"`. Also, providing standard keyboard focus indicators ensures they remain accessible to non-mouse users.
**Action:** Always add `aria-expanded`, dynamic `aria-label`/`title`, `aria-hidden` to decorative icons, and visible focus styles to custom interactive menu components like FABs.
