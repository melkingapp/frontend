
## 2025-02-27 - Icon-Only Button Accessibility Pattern
**Learning:** Found a recurring pattern where icon-only buttons (like those for deleting/downloading/viewing documents in `DocumentUploader.jsx` and the mobile menu toggle in `Header.jsx`) lacked `aria-label` or `title` attributes. This made them inaccessible to screen reader users and non-intuitive when visual icons fail to convey meaning.
**Action:** Added proper `aria-label`s and `title`s alongside visible focus indicators (`focus-visible:ring-2`) to ensure both screen reader support and keyboard accessibility. Going forward, always ensure that buttons containing only icons have descriptive accessible names.
