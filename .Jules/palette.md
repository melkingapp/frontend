## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessible Floating Action Button
**Learning:** Icon-only floating action buttons need localized `aria-label` and `title` attributes that update dynamically (e.g., "باز کردن منو" and "بستن منو"). Decorative icons inside them should have `aria-hidden="true"`, and the state should be reflected via `aria-expanded`.
**Action:** When creating icon-only interactive elements, ensure they have screen reader accessible text, decorative icons are hidden from screen readers, and standard keyboard focus rings (`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) are applied.
