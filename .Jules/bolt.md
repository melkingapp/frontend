## 2025-02-17 - Jest Configuration Conflict
**Learning:** The repository contained conflicting Jest configuration files (`jest.config.js` and `jest.config.cjs`) which prevented tests from running. Additionally, `jest-environment-jsdom` was missing from the configuration despite being in dependencies.
**Action:** Always check for multiple configuration files when encountering test environment errors. Resolve conflicts by keeping only the one matching the project's module type (ESM vs CJS) and ensure necessary environments are installed and configured.
