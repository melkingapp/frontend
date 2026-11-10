## 2024-05-24 - Accessibility improvements for Icon Buttons
**Learning:** Icon-only buttons lacking `aria-label` or `title` attributes cause severe accessibility issues for screen readers. Several components like `BalanceTable` and `BalanceDetailsModal` use icon-only buttons for actions like 'view details', 'close', and 'download' without any accessibility attributes.
**Action:** Always add localized `aria-label` or `title` attributes to icon-only buttons to ensure they are properly announced by screen readers.
