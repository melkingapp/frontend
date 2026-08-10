## 2024-08-10 - ARIA Labels on Icon Buttons
**Learning:** React component files often miss `aria-label`s on icon-only buttons like hamburger menus (`Menu`), `ChevronRight`, `ChevronLeft`, and `X` (close). This pattern seems systemic.
**Action:** Always verify icon-only buttons across headers/sidebars (both public and authenticated) have a clear and descriptive `aria-label` for screen reader users. Use Persian labels (e.g. `aria-label="باز کردن منو"`) since the app is clearly using Persian strings.
