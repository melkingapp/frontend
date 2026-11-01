## 2026-11-01 - [Add keyboard support for custom tooltips]
**Learning:** Icon-only buttons with custom tooltips using `onMouseEnter`/`onMouseLeave` lack keyboard accessibility, as keyboard focus does not trigger hover states.
**Action:** Always pair `onMouseEnter`/`onMouseLeave` with `onFocus`/`onBlur` to ensure tooltips are accessible via keyboard navigation.
