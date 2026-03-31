## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-05-25 - RTL Search Input Pattern
**Learning:** In RTL interfaces (like Persian), the search icon functions best as a "Start" element on the physical Right, while the "Clear" action belongs at the "End" on the physical Left. Input padding must be adjusted dynamically: `pr-10` for the search icon, and `pl-10` only when the clear button is visible (otherwise `pl-4` or similar).
**Action:** For RTL inputs with icons, explicit positioning (`right-3`/`left-3`) and corresponding padding (`pr`/`pl`) is safer than logical properties (`start`/`end`) if the framework doesn't fully abstract them, ensuring consistent visual weight.
