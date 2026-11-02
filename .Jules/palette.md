## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-11-02 - Added accessibility attributes to SelectField
**Learning:** When modifying or creating custom form input components (e.g., `SelectField`, `InputField`), always wrap the component in `forwardRef` to support `react-hook-form` focus management, and include `aria-invalid`, `aria-required`, and `aria-describedby` attributes (linked to the error message ID) for proper accessibility.
**Action:** Ensure these attributes and `forwardRef` are used in all future custom input components.
