## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-18 - RTL Search Box Layout
**Learning:** In RTL interfaces, standard input decorators (like a search icon) should be positioned at the Start (Right), while actionable controls (like a clear button) should be at the End (Left). This mirrors LTR patterns and aligns with user expectations for text direction.
**Action:** When working on RTL inputs, verify icon positioning: informational icons at the start (Right), interactive icons at the end (Left).
