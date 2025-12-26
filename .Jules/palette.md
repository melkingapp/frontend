## 2025-05-23 - Building Selection Accessibility
**Learning:** Converting interactive `div` elements to `<button>` elements significantly improves accessibility by providing native keyboard support and screen reader recognition.
**Action:** When creating list-based selection interfaces, always use `<button>` for items instead of `div`s with `onClick`, and use `aria-pressed` or `aria-current` to indicate state.
