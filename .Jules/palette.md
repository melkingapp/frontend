## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessible Form Validation
**Learning:** Adding `role="alert"` to dynamic error messages allows screen readers to immediately announce them when they appear. However, decorative icons (like AlertCircle) next to the text need `aria-hidden="true"` otherwise the screen reader reads confusing/redundant information about the image.
**Action:** Always pair `role="alert"` on error containers with `aria-hidden="true"` on any adjacent decorative icons within that container to ensure clean audio output.
