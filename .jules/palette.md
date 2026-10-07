## 2026-10-07 - Adding accessibility to icon buttons and date inputs
**Learning:** Icon-only buttons frequently lack `aria-label` attributes, making them inaccessible to screen readers. Adding these attributes and state indications like `aria-expanded` significantly improves usability for visually impaired users without affecting the visual layout.
**Action:** Always ensure any <button> element with only icons (like from `lucide-react`) has a descriptive `aria-label`, and state-toggling buttons have `aria-expanded`.
