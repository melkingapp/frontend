## 2026-10-27 - [Add Focus State to Header Action Buttons]
**Learning:** Icon buttons with custom tooltips or missing default focus states can be less accessible to keyboard users. When using onMouseEnter / onMouseLeave without corresponding keyboard event handlers, keyboard navigation may fall short.
**Action:** Add onFocus and onBlur for tooltip parity and ensure focus-visible:ring-2 for visual focus states in all header action buttons.
