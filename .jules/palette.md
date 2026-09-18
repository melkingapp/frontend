## 2024-05-18 - [Inconsistent Aria Labels in Headers]
**Learning:** Found that while Manager and Resident headers properly implemented aria-label='باز کردن منو' for the mobile menu icon-only button, the Public header completely missed it. This indicates a lack of shared component or shared standard for similar functional parts across different module headers.
**Action:** Next time I review headers, I will check all variations (Manager, Resident, Public) at once to ensure a11y standards are consistently applied.
