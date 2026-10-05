## 2024-05-24 - Missing ARIA label on Public Header Hamburger Menu
**Learning:** The public header's mobile hamburger menu button lacked an `aria-label` (unlike the manager/resident headers), making it invisible to screen readers. It also lacked keyboard focus indicators and an `aria-expanded` state.
**Action:** Always ensure icon-only buttons (especially navigation toggles) have descriptive `aria-label`, `title`, state attributes like `aria-expanded`, and visible focus rings (`focus-visible:ring-2`) to support both screen readers and keyboard users.
