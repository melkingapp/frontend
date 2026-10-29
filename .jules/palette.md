## 2023-10-29 - Keyboard Accessible Tooltips
**Learning:** Tooltips relying only on onMouseEnter and onMouseLeave are inaccessible to keyboard-only users navigating via tab.
**Action:** Always pair onMouseEnter and onMouseLeave with onFocus and onBlur for tooltips on interactive elements, and add visible focus indicators.
