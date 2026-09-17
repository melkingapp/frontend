## 2024-09-17 - Keyboard-accessible Custom Tooltips
**Learning:** The application's custom hover-based tooltip pattern completely bypasses keyboard users unless explicit onFocus/onBlur handlers are implemented.
**Action:** Always pair onMouseEnter/onMouseLeave with onFocus/onBlur for custom tooltips in this codebase, and strictly enforce the standard focus-visible:ring-[#D3B66C] focus ring for consistent accessibility.
