## 2023-11-20 - [Accessibility in Animated Floating Actions]
**Learning:** For components that use simple opacity transitions to visually hide sub-menus (like `FloatingActionButton`), the hidden interactive elements still remain in the DOM's accessibility tree and can be unexpectedly focused via keyboard `Tab` navigation.
**Action:** Always combine opacity-based hiding with `pointer-events-none`, `aria-hidden="true"`, and dynamically bind `tabIndex={open ? 0 : -1}` on nested focusable items to completely remove them from the keyboard navigation flow when visually hidden.
