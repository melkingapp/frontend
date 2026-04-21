## 2024-05-15 - Improve Form Accessibility in Settings Components
**Learning:** The settings form inputs (`SettingsInput`) and custom toggles (`NotificationToggle`) were lacking essential ARIA attributes (`aria-describedby`, `aria-invalid`) to associate labels, error messages, and descriptions with the input fields, making it difficult for screen reader users to understand validation errors and context.
**Action:** Added proper ARIA connections using dynamic IDs (e.g. `${id}-error` and `${id}-desc`) and updated SVGs to be decorative (`aria-hidden="true"`) to prevent redundant announcements.
