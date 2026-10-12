## 2025-02-14 - Accessibility of Icon-Only Buttons in ChargeSchedulesList
**Learning:** Icon-only action buttons lacked screen reader announcements (aria-label) and keyboard focus indicators.
**Action:** Always add `aria-label` matching the `title` attribute and include `focus:outline-none focus-visible:ring-2 focus-visible:ring-melkingGold` (or an appropriate ring color) to all icon-only buttons for consistent keyboard accessibility.
