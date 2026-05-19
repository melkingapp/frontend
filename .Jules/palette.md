## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-19 - Accessible Icon-Only Buttons in Editable Cards
**Learning:** Icon-only buttons used for inline editing actions (like `EditableCard`) often lack screen reader support and proper keyboard focus visibility, causing an accessibility gap.
**Action:** Consistently ensure icon-only buttons include localized `aria-label`s, `title`s for tooltips, and standard focus ring utilities (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) to maintain both keyboard accessibility and visual hierarchy.
