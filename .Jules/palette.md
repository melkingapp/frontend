## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-07-11 - Add aria-labels and visual focus to edit buttons in cards
**Learning:** Icon-only buttons embedded in cards (like the `Edit` button in `EditableCard`) often lack screen-reader context and keyboard focus states. When users navigate cards via keyboard, a missing focus outline makes it impossible to tell which action is active. Using `focus-visible` ring utilities with the brand's gold color (`melkingGold`) ensures clarity for keyboard users without disrupting mouse interactions.
**Action:** Always ensure icon-only actions have `aria-label` or `title` attributes. Provide explicit `focus-visible` styling using the established brand colors (`focus-visible:ring-melkingGold`) to maintain consistency and accessibility.
