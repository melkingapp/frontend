## 2024-06-21 - [CRITICAL] Fix Broken Authentication
**Learning:** Checking JWT expiration locally on the client without verifying the token with the server can lead to Auth Bypass vulnerabilities, especially if tokens are forged or revoked.
**Action:** Always verify local tokens by calling an authenticated server endpoint (like `/profile/`) and properly handle authentication rejections (401, 403) distinctively from transient network errors. Use `sanitizeUser` before storing external data.
## 2024-06-21 - CI Migration for PNPM
**Learning:** In a pnpm workspace, `npm ci` will fail with an outdated lockfile error (e.g. `ERR_PNPM_OUTDATED_LOCKFILE` equivalent).
**Action:** When migrating Github Actions CI to pnpm, explicitly add the `pnpm/action-setup` step with the correct version matching `pnpm-lock.yaml`, change the `actions/setup-node` cache to `pnpm`, and use `pnpm install --frozen-lockfile` instead of `npm ci`.
