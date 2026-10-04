## 2024-10-04 - Standardizing ARIA Labels on Icon-Only Buttons
**Learning:** In React apps, small interactive elements like mobile menu toggles or document uploader 'clear' buttons are often implemented as icon-only without proper screen reader accessible labels. Relying solely on visual cues (like an X icon) excludes visually impaired users.
**Action:** Always verify that every `<button>` without visible text contains an appropriate `aria-label` and `title` (localized to Persian, e.g., 'باز کردن منو'), and ensure `aria-expanded` is used for toggles.
