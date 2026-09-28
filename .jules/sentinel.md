## 2026-09-28 - Prevent Sensitive Data Leak in LocalStorage
**Learning:** Storing the entire Redux auth state in localStorage without sanitizing the user object can leak sensitive metadata or tokens.
**Action:** Always apply sanitization functions (like sanitizeUser) to the state payload before serializing it for localStorage.
