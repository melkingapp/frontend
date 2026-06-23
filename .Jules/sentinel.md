## 2024-05-24 - Fix Auth Bypass
**Learning:** Client-side only token validation (e.g., checking expiration dates) is insufficient and vulnerable to auth bypass.
**Action:** Always use server-side validation (e.g., calling an API endpoint like getProfile()) and enforce strict HTTP status code checking (401/403) before logging out.
