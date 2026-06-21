## 2024-06-21 - [CRITICAL] Fix Broken Authentication
**Learning:** Checking JWT expiration locally on the client without verifying the token with the server can lead to Auth Bypass vulnerabilities, especially if tokens are forged or revoked.
**Action:** Always verify local tokens by calling an authenticated server endpoint (like `/profile/`) and properly handle authentication rejections (401, 403) distinctively from transient network errors. Use `sanitizeUser` before storing external data.
