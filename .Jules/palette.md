## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Accessibility improvements for Custom Input Groups
**Learning:** For custom group inputs (like CheckboxGroup or RadioGroup) that use a `div` wrapper instead of a native `fieldset` and `legend`, using a `div` with `role="group"`, linking it to the label via `aria-labelledby`, and linking errors via `aria-describedby` provides the necessary semantic context for screen readers. Connecting this with React's `useId()` ensures dynamic and unique accessibility IDs.
**Action:** Use `role="group"` combined with `aria-labelledby` when wrapping multiple custom inputs without a `fieldset`. Ensure focus rings match standard styles (e.g., `#D3B66C`).
