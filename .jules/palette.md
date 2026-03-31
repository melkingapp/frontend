## 2024-05-19 - Missing ARIA Labels on Icon-only Action Buttons
**Learning:** Found a pattern where secondary action buttons in data tables (specifically the 'Eye' view icon in `BalanceTable`) lack both `aria-label` and `title` attributes. This renders them invisible to screen readers and hides their purpose from sighted users relying on tooltips.
**Action:** When implementing or reviewing icon-only buttons in table rows, always verify the presence of descriptive, localized `aria-label` and `title` attributes (e.g., 'مشاهده تراکنش').
