## 2024-10-14 - Keyboard Accessibility for Custom Tooltips
**Learning:** Custom tooltips that trigger on mouse hover (`onMouseEnter`, `onMouseLeave`) exclude keyboard-only and screen reader users from seeing context. Keyboard focus events must be paired with hover events.
**Action:** Always pair `onMouseEnter` and `onMouseLeave` with `onFocus` and `onBlur` for interactive elements to ensure parity for keyboard navigation.
