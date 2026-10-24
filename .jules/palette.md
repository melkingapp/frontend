## 2026-10-24 - Mobile Menu Toggle Accessibility
**Learning:** Icon-only toggle buttons like mobile menus require localized `aria-label` (e.g., 'باز کردن منو'), `title`, and `aria-expanded` to convey their purpose and current state to screen reader users.
**Action:** Always ensure state-toggling buttons have `aria-expanded` bound to their state variable, and maintain focus visibility.
