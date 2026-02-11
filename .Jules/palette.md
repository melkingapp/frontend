## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-09 - RTL Input Adornments
**Learning:** In RTL layouts, "Start" is visually on the Right and "End" is on the Left. When adding adornments (like icons or shortcut hints) to inputs, verify their placement relative to the text direction. Specifically, `placeholder` text aligns to the Start (Right), so placing absolute elements at `right-0` (Start) can overlap with the placeholder.
**Action:** Place input actions (clear button, shortcut hint) at the End (Left in RTL) side, or ensure sufficient padding at the Start (Right) if placing them there.
