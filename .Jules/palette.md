## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - RTL Search Box Patterns
**Learning:** In RTL interfaces, standardizing the search icon to the visual start (Right) and clear actions to the visual end (Left) aligns with natural reading order and prevents visual collisions. Explicitly clearing text with a button is critical for mobile users who cannot easily "backspace" repeatedly.
**Action:** When designing input groups in RTL, verify "start/end" alignment logic matches "right/left" CSS classes, and always include `aria-label` for icon-only action buttons.
