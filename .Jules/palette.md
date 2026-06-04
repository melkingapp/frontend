## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-03-05 - Add keyboard support for custom tooltips
**Learning:** Custom tooltips that rely purely on `onMouseEnter` and `onMouseLeave` are completely invisible to keyboard-only users navigating via Tab, violating WCAG 2.1 SC 1.4.13.
**Action:** Always pair hover events with `onFocus` and `onBlur` (e.g., `onFocus={() => setHovered(id)}` and `onBlur={() => setHovered(null)}`) alongside explicit `focus-visible` styling when building custom tooltip components on icon buttons.
