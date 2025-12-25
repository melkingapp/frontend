## 2025-12-25 - [Accessibility] OTP AutoComplete
**Learning:** Mobile users on split-input OTP forms often struggle with autofill if `autoComplete='one-time-code'` is missing. Adding this attribute is a critical, low-effort high-impact win for SMS authentication flows.
**Action:** Always verify `autoComplete='one-time-code'` on OTP inputs.
