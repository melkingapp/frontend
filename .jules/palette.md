## 2024-07-19 - Floating Action Button Accessibility
**Learning:** Icon-only floating action buttons in Persian apps need dynamic `aria-label`s (like 'باز کردن منو' / 'بستن منو') to communicate their expanding state, and explicit focus rings (using theme colors like `melkingGold`) are critical since they are often positioned absolutely and outside normal document flow.
**Action:** Always include `aria-expanded`, dynamic `aria-label`/`title` attributes, and `focus-visible` styles using standard utility classes on floating/fixed navigation elements.
