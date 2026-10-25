## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-10-25 - Interactive Icon Accessibility
**Learning:** Icon-only buttons with hover tooltips in the Header components lacked keyboard equivalent interactions (`onFocus`/`onBlur`) and state markers, causing poor accessibility for non-mouse users.
**Action:** Pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` for tooltips, and add `aria-expanded`, `title`, and explicit focus styles like `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]` to all icon buttons.
