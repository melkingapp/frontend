## 2024-06-26 - Client-Side Only Auth Bypass
**Learning:** Relying solely on client-side token expiration checks or localStorage hydration without server-side validation (e.g., calling a `/profile` endpoint) allows attackers to forge tokens or manipulate localStorage state to bypass protected routes.
**Action:** Always verify the session with the server (e.g., via a protected API call) during initial hydration or token validation, and force logout on 401/403 responses.
