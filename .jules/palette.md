## 2024-11-05 - Accessible Mobile Menu Toggles
**Learning:** Icon-only menu buttons in the app's header components lack localized ARIA labels and expanded states, breaking screen reader navigation for mobile users.
**Action:** Always add aria-label (localized, e.g., 'باز کردن منو') and aria-expanded to state-toggling icon buttons, alongside standard focus ring classes for keyboard visibility.
