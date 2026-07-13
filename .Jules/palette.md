## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-01-08 - [Add aria-labels to icon-only buttons]
**Learning:** Found a recurring pattern in list items and modals where icon-only buttons (like edit and close) lack accessible names (`aria-label`) and distinct keyboard focus indicators (`focus-visible`).
**Action:** Always verify and add localized `aria-label`s and `focus-visible:ring-2 focus-visible:ring-melkingGold focus:outline-none` classes to all icon-only interactive elements to support screen readers and keyboard users.
