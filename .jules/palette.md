## 2024-11-11 - Custom Form Components Require forwardRef and ARIA attributes
**Learning:** Custom form inputs like SelectField must use forwardRef to support react-hook-form focus management, and require standard accessibility attributes (aria-required, aria-invalid, aria-describedby) linked to error message IDs to be properly usable by screen readers.
**Action:** Always wrap custom form components in forwardRef and pass down required, aria-required, aria-invalid, and aria-describedby when creating or modifying them.
