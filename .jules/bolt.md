## 2024-05-18 - Prevent Unnecessary Re-renders in Lists
**Learning:** Table row components that receive complex props like objects (e.g., transaction) can cause significant performance bottlenecks due to frequent re-renders when parent lists update, even if the row's data hasn't changed. Standard shallow comparison with React.memo is highly effective for these isolated list items.
**Action:** Consistently wrap list item components like FinanceTableRow with React.memo() to prevent them from re-rendering unless their specific props change, particularly in complex views like transaction lists.
