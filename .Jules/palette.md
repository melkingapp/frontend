## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-05-26 - Missing Aria Labels on Action Buttons in DocumentUploader
**Learning:** Icon-only buttons used for actions such as 'Download', 'View', 'Delete', and 'Clear' inside document uploader components lacked `aria-label`s, causing screen readers to not announce their specific functionality.
**Action:** Always add descriptive `aria-label` attributes to icon-only interactive elements (such as `<button>` or `<a>` tags) inside lists or form inputs.
