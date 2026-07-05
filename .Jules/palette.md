## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-07-05 - Accessible Floating Action Buttons
**Learning:** Icon-only floating action buttons need explicit ARIA labels and focus indicators, and state toggles like aria-expanded for screen readers. Using focus-visible:ring-2 with an app-specific color like melkingGold maintains the visual theme while providing keyboard accessibility.
**Action:** Always add aria-label, aria-expanded, title, and focus-visible classes to icon-only toggle buttons and their menu items.
