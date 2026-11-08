## 2024-11-08 - React Hook Form Component Architecture
**Learning:** In this codebase, custom form components like SelectField must be wrapped in forwardRef to support react-hook-form's automatic focus management for validation errors. They also require proper linking via aria-describedby and aria-invalid to ensure screen readers announce these errors.
**Action:** Always wrap new or modified form inputs in forwardRef and include aria-required, aria-invalid, and aria-describedby tied to the error message ID.
