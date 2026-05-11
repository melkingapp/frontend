## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Handling Conditional Help Text in Settings Components
**Learning:** When using conditional help text elements (e.g., hiding help text if an error exists), it's important to not conditionally set the `id` string itself in the `describedBy` list to avoid dangling references. If the element won't render, the ID shouldn't be in `aria-describedby`.
**Action:** When dynamically constructing `aria-describedby` arrays, ensure the condition that checks if an ID should be included perfectly mirrors the condition used to render the actual help text/error DOM element.
