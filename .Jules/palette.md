## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-08-04 - Improved Keyboard Navigation Focus Visibility in Header
**Learning:** React/Tailwind applications relying heavily on custom button styles without explicit `focus-visible` utilities often fail keyboard accessibility checks. Relying on default browser outlines can look broken or be stripped by base resets.
**Action:** Always add explicit `focus:outline-none focus-visible:ring-2` with an app-appropriate ring color (e.g. `focus-visible:ring-[#D3B66C]`) to interactive elements, particularly icon-only buttons and links, to ensure keyboard navigation is both functional and visually integrated.
