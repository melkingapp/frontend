## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-06-02 - Custom Dropdown Accessibility
**Learning:** Custom dropdown components built without native `<select>` tags lack critical screen reader support for linking the toggle button to the dropdown list options.
**Action:** Always add `aria-expanded`, `aria-haspopup`, and `aria-controls` to the toggle button. Link `aria-controls` to the list container's `id` and assign `role="listbox"`. The list items must have `role="option"` and `aria-selected`. Ensure `focus-visible` styles are consistently applied for keyboard navigation.
