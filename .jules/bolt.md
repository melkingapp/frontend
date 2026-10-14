## 2026-10-14 - Optimize React Rendering by Removing Inline IIFEs
**Learning:** Defining and executing an Immediately Invoked Function Expression (IIFE) inline within a React render loop introduces unnecessary performance overhead and garbage collection pressure on every render cycle.
**Action:** Refactored inline IIFEs in render methods by calculating derived values prior to the return statement or utilizing useMemo when computationally expensive.
