## 2024-05-23 - Floating Action Button Accessibility
**Learning:** Icon-only buttons (like FABs) are inaccessible to screen readers without explicit `aria-label`. Interactive menus need `aria-expanded` and `aria-haspopup` to communicate state.
**Action:** Always audit icon-only buttons for `aria-label`. Use `aria-expanded` for toggleable UI elements.
