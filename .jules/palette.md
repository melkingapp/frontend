## 2024-05-24 - Hidden Elements Accessibility
**Learning:** The codebase frequently uses `opacity-0 pointer-events-none` for hiding menus/modals with transitions. This visually hides the elements but leaves them focusable by keyboards and readable by screen readers, causing accessibility issues.
**Action:** Always pair visual hiding (like `opacity-0`) with `aria-hidden={true}` and `tabIndex={-1}` on interactive children to fully remove them from the accessibility tree and focus order.
