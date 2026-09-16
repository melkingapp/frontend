## 2026-09-16 - [Keyboard Accessible Tooltips]
**Learning:** Custom tooltips that rely solely on hover events exclude keyboard users. Icon-only buttons must present their label to both screen readers and sighted keyboard users.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` when creating custom tooltips, and ensure interactive elements have visible focus rings (`focus-visible:ring`) to indicate focus state clearly.
