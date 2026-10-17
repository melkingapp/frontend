## 2026-10-17 - Keyboard Accessible Tooltips
**Learning:** Custom tooltips that rely on mouse hover events (`onMouseEnter`, `onMouseLeave`) are invisible to keyboard users unless paired with focus events.
**Action:** Always pair hover events with `onFocus` and `onBlur` for parity and accessibility, particularly for icon-only buttons.
