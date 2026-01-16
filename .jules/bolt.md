## 2024-02-14 - Moment.js in Sort Comparators
**Learning:** Using `moment()` inside `Array.prototype.sort()` creates a new Moment object for every comparison (O(n log n)), causing significant performance degradation in list rendering.
**Action:** Always prefer `new Date().getTime()` or `Date.parse()` inside sort functions. For heavy date manipulation libraries, instantiate them once outside the loop/sort if absolutely necessary, or stick to native `Date` for comparisons.
