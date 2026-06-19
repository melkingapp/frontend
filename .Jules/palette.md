## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-06-25 - Ensure keyboard access for custom tooltip interactive elements
**Learning:** For interactive elements with custom hover tooltips, using `onMouseEnter` and `onMouseLeave` is only sufficient for mouse users. Keyboard users navigating via Tab will not trigger the tooltip to explain the icon button's purpose if it is not handled properly.
**Action:** Always pair `onMouseEnter` and `onMouseLeave` with `onFocus` and `onBlur`. In addition to explicit `focus-visible` styles like `focus-visible:ring-2 focus-visible:ring-melkingGold`, use the native `title` attribute for fallbacks, ensuring keyboard users receive equivalent contextual information.
