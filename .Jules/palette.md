## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-07-07 - EditableCard Focus State and Screen Reader Accessibility
**Learning:** Found an icon-only edit button inside the `EditableCard.jsx` component that lacked an `aria-label` and `title` tooltip. The button also did not have a clear keyboard focus state defined, making keyboard navigation less intuitive.
**Action:** Consistently add `aria-label` (using dynamic content like the `title` prop when possible) and `title` to all icon-only buttons. Utilize existing design tokens like `focus-visible:ring-melkingGold` to apply clear, brand-aligned keyboard focus rings.
