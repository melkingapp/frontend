## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-24 - Accessibility for Group Inputs (CheckboxGroup/RadioGroup)
**Learning:** Using `<fieldset>` and `<legend>` for custom input groups can cause visual regressions with existing Tailwind borders. Using `role="group"` on a standard `<div>` combined with `aria-labelledby` linked to the group title (using `useId()`) provides identical screen reader semantics without breaking styles.
**Action:** Always prefer `role="group"` with `aria-labelledby` for custom React grouped inputs instead of native fieldsets when dealing with strict styling constraints.
## 2024-05-24 - Removing missing external dependencies
**Learning:** Adding new dependencies like `clsx` is strictly forbidden by the system instructions ("only pnpm", "never add new dependencies"). If a codebase uses a missing dependency that breaks the CI build, replacing it with a simple local utility function (e.g., `function classNames(...classes) { return classes.filter(Boolean).join(' '); }`) resolves the build error without violating constraints.
**Action:** Use a local `classNames` utility function or standard template literals instead of installing missing UI dependency libraries like `clsx` or `classnames` to adhere to strict repository constraints.
