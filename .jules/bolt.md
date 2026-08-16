## 2024-08-16 - Memoization in Large Lists
**Learning:** In applications like Melking that display financial ledgers or large tables, rendering lists of functional components (like FinanceTableRow) without React.memo causes a performance bottleneck because the entire list re-renders when parent state (like active modal or filter) changes.
**Action:** When working with list rows in React, especially those dealing with complex logic or multiple props like formatting utilities, wrap them in React.memo to skip re-rendering if props are unchanged.
