# Performance Optimization Plan
1. Refactor `BuildingRequestStatus` to use `useMemo` for filtering and grouping `requests`.
   - The current implementation directly maps and filters `requests` in the render block via an IIFE.
   - We will extract this logic to a `useMemo` hook, caching the result as `uniqueRequests`.
2. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
3. Submit the change.
