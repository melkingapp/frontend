## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.

## 2024-05-24 - Mobile OTP Experience
**Learning:** For split-input OTP forms, adding `autoComplete="one-time-code"` to the *first* input (and ensuring it's focused) allows iOS/Android to automatically suggest the code from SMS. This is a massive friction reducer.
**Action:** Always add `autoComplete="one-time-code"` to the first input of any OTP/2FA form.
