## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2025-05-27 - SettingsInput Accessibility Improvements
**Learning:** For accessible inputs with conditional error and help messages, the dynamic array construction for `aria-describedby` (e.g., `[errorId, helpId].filter(Boolean).join(' ') || undefined`) ensures that screen readers are given the exact context needed. Placing `role="alert"` directly on the error container ensures immediate screen reader feedback when an error appears.
**Action:** Always implement this explicit ID generation and linking for inputs that display dynamic validation errors, and proactively set `aria-hidden="true"` on adjacent decorative icons to prevent redundant audio announcements.
