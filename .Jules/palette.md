## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2025-02-19 - Testing Tailwind Visibility in JSDOM
**Learning:** JSDOM does not process CSS classes like `invisible` or `opacity-0`. `toBeVisible()` assertions fail to detect these hiding mechanisms.
**Action:** When testing visibility of Tailwind components in JSDOM, assertions must check for the presence of specific classes (e.g., `.toHaveClass('invisible')`) or attributes (`aria-hidden`) rather than relying on `.not.toBeVisible()`.
