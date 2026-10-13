## 2024-10-13 - Focus/Hover Parity for Tooltips
**Learning:** Interactive icon buttons with custom hover-based tooltips fail accessibility checks if they lack keyboard focus events (`onFocus`/`onBlur`), preventing keyboard users from seeing tooltips.
**Action:** Always pair `onMouseEnter` and `onMouseLeave` with `onFocus` and `onBlur` for custom tooltips, and add native `title` and `aria-label` attributes to icon-only buttons.
