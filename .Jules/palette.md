## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Custom Select & Date Picker Accessibility
**Learning:** Custom UI components like date pickers that don't use standard `<select>` or `<input type="date">` often lack keyboard accessibility and screen reader support. Icon-only buttons for navigating months or opening calendars need clear, localized `aria-label` attributes. Additionally, dynamically rendered day buttons in a calendar grid should have `aria-label`s that specify the full date (e.g., "انتخاب روز ۱۵ اردیبهشت") instead of just the day number to provide context to screen reader users.
**Action:** When auditing custom date pickers or select menus, ensure all interactive elements (toggles, next/prev buttons, item buttons) have descriptive `aria-label`s, especially if they rely on icons or lack contextual text.
