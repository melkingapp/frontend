## 2024-05-24 - Accessible State-Toggling Icon Buttons
**Learning:** Icon-only state-toggling buttons (like mobile menus) lacking `aria-expanded` and semantic labels block screen readers from announcing menu state changes.
**Action:** Always include localized `aria-label`, `title`, `aria-expanded`, and explicit `focus-visible` styling using app brand colors (e.g., `#D3B66C`) on state-toggling icon buttons.
