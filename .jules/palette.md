## 2026-10-30 - Added a11y attributes to Header menu button
**Learning:** Icon-only menu buttons in public headers missed a11y labels and focus states.
**Action:** Ensure all icon-only buttons have localized aria-labels, aria-expanded for toggles, and use standard focus rings (e.g. `focus-visible:ring-[#D3B66C]`).
