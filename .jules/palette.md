## 2024-08-12 - Added Accessible Names to Icon-Only Buttons
**Learning:** Found an icon-only edit button in EditableCard missing accessible names and keyboard focus styles, making it invisible to screen readers and difficult to navigate for keyboard users.
**Action:** Consistently add `aria-label`, `title`, and `focus-visible:ring-2` to all icon-only buttons to ensure they are accessible.
