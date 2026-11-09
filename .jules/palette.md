## 2024-11-09 - ForwardRef on SelectField
**Learning:** Custom UI input components like SelectField must support `forwardRef` to integrate properly with focus management tools (like `react-hook-form`). Additionally, `aria-required`, `aria-invalid`, and `aria-describedby` (linking to error messages) are essential attributes.
**Action:** Always wrap custom form inputs with `forwardRef`, pass `ref` to the native input element, and include `required` along with `aria-` attributes linking states and errors.
