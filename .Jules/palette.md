## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-14 - Icon-only buttons lack ARIA labels
**Learning:** Found an accessibility issue pattern where icon-only buttons (like in EditableCard) are missing aria-labels and keyboard focus indicators.
**Action:** Always verify icon-only buttons have localized aria-label attributes and clear focus states.
