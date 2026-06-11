## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-02-20 - Accessible tooltips on icon buttons
**Learning:** For interactive icon buttons that rely on `onMouseEnter`/`onMouseLeave` to show custom tooltips, keyboard-only users navigating via Tab completely miss the context. Relying solely on `aria-label` isn't enough for sighted keyboard users.
**Action:** Always pair hover events with `onFocus` and `onBlur` to trigger the tooltip display. Additionally, explicitly style focus rings (`focus-visible:ring-2`) and provide a native `title` attribute as a fallback to ensure these controls are usable and trackable without a mouse.
