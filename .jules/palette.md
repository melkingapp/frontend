## $(date +%Y-%m-%d) - Keyboard Accessibility for Custom Tooltips
**Learning:** Custom hover-based tooltips (using onMouseEnter/onMouseLeave) hide contextual information from keyboard users unless onFocus/onBlur are also explicitly implemented alongside focus-visible styles.
**Action:** Always pair onMouseEnter with onFocus and onMouseLeave with onBlur for custom tooltips, and ensure interactive icon buttons have visible focus rings (focus-visible:ring-2).
