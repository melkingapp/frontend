## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-27 - Icon Buttons and Focus Rings
**Learning:** In React components like EditableCard, icon-only edit buttons often lack proper ARIA labels and focus rings, reducing keyboard accessibility for screen readers.
**Action:** Consistently add `aria-label`, `title`, and custom focus rings (`focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) to icon-only buttons to enhance a11y.
