## 2024-10-16 - Keyboard Parity for Custom Tooltips
**Learning:** Custom tooltips for icon-only buttons relied solely on `onMouseEnter` and `onMouseLeave`, completely ignoring keyboard navigation. Without focus events (`onFocus`, `onBlur`), keyboard users receive no context.
**Action:** Always pair mouse hover events with focus events for custom interactions, ensure icon-only buttons have localized `aria-label` and `title` attributes, and consistently apply the standard focus ring (`focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D3B66C]`).
