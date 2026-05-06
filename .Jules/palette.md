## 2024-05-24 - Accessibility improvements for Form Inputs
**Learning:** Adding `aria-describedby`, `aria-invalid`, and `aria-required` to input fields significantly improves screen reader experience by linking errors and requirements to the input itself. Using `forwardRef` is crucial for libraries like `react-hook-form` to manage focus correctly (e.g., focusing on the first invalid field).
**Action:** Always wrap form inputs with `forwardRef` and ensure error messages are programmatically linked to their inputs via ID.
## 2024-05-06 - Accessible Icon-Only Floating Action Buttons
**Learning:** Interactive icon-only components in the shared UI (like `FloatingActionButton`) lacked localized `aria-label`, `title` attributes, proper `aria-expanded` and `aria-haspopup` roles, and needed explicit focus indicators (`focus-visible:ring-2 focus-visible:ring-[#D3B66C]`) for proper screen reader support and keyboard accessibility.
**Action:** When creating or modifying generic UI components in this app that use icon-only toggles, always add these essential accessibility attributes and use the app's standard focus ring style `focus-visible:ring-[#D3B66C]` to maintain consistency.
