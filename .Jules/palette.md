## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - SearchBox Accessibility and RTL Enhancements
**Learning:** `SearchBox` required RTL-specific icon positioning (Search icon at start/right, Clear button at end/left) to align with the Persian interface. Adding a clear button and `Ctrl+K` shortcut significantly improves usability.
**Action:** When designing input components for RTL, ensure action icons (like clear) are at the logical end (left) and decorative/label icons are at the logical start (right). Always verify `clsx` or similar utility libraries are properly listed in `package.json` if used.

## 2024-05-24 - Jest Configuration for ESM
**Learning:** In a `"type": "module"` project, Jest configuration files must be `.cjs` (CommonJS) if they use `module.exports`. Mixed usage of `export default` in `.cjs` files causes failures.
**Action:** Ensure `jest.config.cjs` and `babel.config.cjs` strictly use CommonJS syntax (`module.exports`) to avoid "Multiple configurations found" or syntax errors.
