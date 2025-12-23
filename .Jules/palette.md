## 2024-05-22 - OTP Input Accessibility
**Learning:** split-input OTP fields are a nightmare for screen readers without explicit `aria-label`s for each digit (e.g., "Digit 1", "Digit 2").
**Action:** Always add `aria-label` and `autoComplete="one-time-code"` to multi-input fields.
