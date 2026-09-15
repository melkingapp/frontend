## 2024-05-24 - Fix Client-Side Auth Bypass
**Learning:** Relying solely on client-side JWT decoding (e.g., using `atob`) to verify authentication bypasses server-side validation and introduces a vulnerability where forged tokens can grant access.
**Action:** Always verify authentication state against the server by dispatching an API call (e.g., `fetchUserProfile`) instead of relying on client-side claims.
