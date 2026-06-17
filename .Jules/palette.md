## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-18 - [Accessible Icon Tooltips]
**Learning:** Custom tooltips on interactive icon buttons that rely solely on hover events are inaccessible to keyboard users and lack native fallback mechanisms.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` event handlers, add explicit `focus-visible:ring-2` styling, and include a native `title` attribute on all icon-only buttons to ensure they are accessible and trackable for keyboard navigation via Tab.
