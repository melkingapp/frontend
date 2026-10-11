## 2024-10-11 - Inline IIFEs in Render Loops
**Learning:** Re-creating and executing a function (IIFE) inside a `.map()` block on every render cycle causes unnecessary overhead and garbage collection pressure, particularly in lists.
**Action:** Always extract inline IIFEs in loops to direct variable declarations within the loop's scope.
