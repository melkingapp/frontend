## 2024-05-15 - Broken Authentication
**Learning:** Client-side only redirects checking JWT expiry via atob() can be trivially bypassed by modifying localStorage.
**Action:** Always verify tokens via a server-side request on app initialization.
