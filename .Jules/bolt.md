## 2024-02-12 - Jest Configuration Conflict
**Learning:** The project contained duplicate Jest and Babel configuration files (`.js` and `.cjs`), causing conflicts and preventing tests from running. Also `jest-environment-jsdom` was missing from `node_modules` despite being in `package.json`.
**Action:** Always check for duplicate configuration files and ensure `node_modules` is in sync with `package.json` before running tests.
