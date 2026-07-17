## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-18 - Improve Header Accessibility
**Learning:** Found that header icon-only buttons lacked proper ARIA labels and keyboard focus states, making navigation difficult for screen readers and keyboard users.
**Action:** Always add localized `aria-label` and `title` to icon-only buttons (e.g., "باز کردن منو" in Persian) and use `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]` or the app's standard focus ring color to enforce keyboard accessibility consistently.
