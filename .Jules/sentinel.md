## 2024-05-24 - Broken Authentication: Client-Side Redirect
**Learning:** Relying on `window.location.href` for unauthenticated redirects bypasses React Router state and Redux Auth store management, leading to Broken Authentication flow vulnerabilities where state remains active despite being visually redirected.
**Action:** Always dispatch a central unauthorized event (like `api-unauthorized`) caught by an AuthMonitor or similar wrapper to ensure proper state teardown (like `forceLogout`) occurs before client-side navigation.
