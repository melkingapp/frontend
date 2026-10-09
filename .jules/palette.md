## 2024-05-24 - Keyboard Accessible Custom Tooltips
**Learning:** Custom tooltips that rely solely on `onMouseEnter` and `onMouseLeave` leave keyboard users unaware of the button's purpose if they cannot see the icon clearly or rely on visible tooltips.
**Action:** Always pair mouse hover events with `onFocus` and `onBlur` for custom tooltips on icon-only buttons to ensure they appear during keyboard navigation.
