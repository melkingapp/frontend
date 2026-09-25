## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-20 - Adding ARIA attributes to Mobile Menu Hamburger Button
**Learning:** The mobile menu hamburger button in `Header.jsx` lacked ARIA attributes and keyboard focus styling, which makes it difficult for screen readers and keyboard users to navigate the primary site navigation on mobile.
**Action:** Always ensure that icon-only buttons like the mobile menu toggler have localized `aria-label` and `title` attributes (e.g. 'باز کردن منو'), an `aria-expanded` attribute indicating the state, and clear focus indicators using existing utility classes like `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`.
